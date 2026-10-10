// The agent graph. A stateful, resumable workflow (not a chat loop):
//
//   intake → coding → policy RAG → criteria matcher → [gaps? pause for clinician]
//   → packet writer → insurer simulator ⇄ rebuttal → verifier (writer retries ≤2)
//   → denial predictor → [pause for human approval] → submission → payer decision
//   → (denied) appeal agent → [human] → appeal decision → learning loop
//
// Every step is streamed to the UI (SSE) and written to the append-only audit log.
import { db, save, newId, getPatient, getPolicy, chartDocuments } from "../db.js";
import { emit, touch, audit } from "../events.js";
import { sleep } from "../utils/text.js";
import { runIntake } from "./intake.js";
import { runCoding } from "./coding.js";
import { runPolicyRetrieval } from "./policyRag.js";
import { runMatcher } from "./matcher.js";
import { runGapCloser } from "./gapCloser.js";
import { runPacketWriter, fixPacket } from "./packetWriter.js";
import { runInsurerSimulator } from "./insurerSimulator.js";
import { runVerifier } from "./verifier.js";
import { featuresFromCase, predict } from "./denialPredictor.js";
import { readinessScore } from "./readiness.js";
import { runCoverageCheck } from "./coverage.js";
import { decide, denialLetter } from "./payerMock.js";
import { runAppeal } from "./appeal.js";
import { aiModeInfo } from "../llm.js";
import { extractText, analyseText, exclusionReason } from "./reader.js";
import { readFile } from "../files.js";
import { resolveProcedure } from "../data/codes.js";

const STEP_DELAY = Number(process.env.PIPELINE_STEP_DELAY_MS ?? process.env.STEP_DELAY_MS ?? 500);
const DECISION_DELAY = Number(process.env.PAYER_DECISION_DELAY_MS ?? 3000);
const running = new Set();
let fast = false;

/** Seed script runs the graph without animation delays. */
export function setFastMode(v) {
  fast = v;
}
const pause = () => (fast ? Promise.resolve() : sleep(STEP_DELAY));

function agentAudit(caseObj, action, payload) {
  audit({ caseId: caseObj.id, actorType: "agent", actorId: action.split(".")[0], action, payload });
}

function context(caseObj) {
  const patient = getPatient(caseObj.patientId);
  const documents = chartDocuments(caseObj.patientId);
  const policy = caseObj.policy ? getPolicy(caseObj.policy.id) : null;
  return { patient, documents, policy };
}

export function createCase({ patientId, order, user }) {
  const patient = getPatient(patientId);
  if (!patient) throw new Error("Unknown patient");
  const store = db();
  store.counters.case += 1;
  const now = new Date().toISOString();
  const caseObj = {
    id: `C-${store.counters.case}`,
    patientId,
    patientName: patient.name,
    order: { cpt: order.cpt, procedureName: order.procedureName || null, kind: order.kind || null, reason: order.reason, urgency: order.urgency || "routine", payer: order.payer || patient.payer, setting: order.setting || "outpatient" },
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
    createdBy: user?.name || "system",
    assignedTo: "Priya (PA Coordinator)",
    timeline: [],
    facts: [],
    coding: null,
    policy: null,
    coverage: null,
    retrieved: [],
    criteria: [],
    gaps: [],
    decisions: {},
    packet: null,
    adversarial: null,
    verifier: null,
    prediction: null,
    readiness: null,
    predictionHistory: [],
    submission: null,
    denial: null,
    appeal: null,
    outcome: null,
    modes: {},
    metrics: { startedAt: now },
  };
  store.cases.unshift(caseObj);
  save();
  audit({ caseId: caseObj.id, actorType: "human", actorId: user?.email || "system", action: "case.created", payload: { patientId, cpt: order.cpt, procedure: resolveProcedure(order).short } });
  return caseObj;
}

export function runInBackground(caseObj, from = "intake") {
  runFrom(caseObj, from).catch((err) => {
    console.error(err);
    emit(caseObj, "system", "error", `Workflow error: ${err.message}`);
    caseObj.status = "ERROR";
    touch(caseObj);
  });
}

export async function runFrom(caseObj, from = "intake") {
  if (running.has(caseObj.id)) return;
  running.add(caseObj.id);
  try {
    await graph(caseObj, from);
  } finally {
    running.delete(caseObj.id);
  }
}

async function graph(caseObj, from) {
  const order = ["intake", "coding", "policy", "matcher", "gaps", "writer", "insurer", "verifier", "predictor", "review"];
  const at = (s) => order.indexOf(s) >= order.indexOf(from);
  let { patient, documents, policy } = context(caseObj);
  emit(caseObj, "system", "info", `Copilot ${from === "intake" ? "started" : `resumed at ${from}`} (${aiModeInfo().mode === "llm" ? `${aiModeInfo().providerLabel}: ${aiModeInfo().model}` : "rule engine"})`);

  // 0. Report Reader: uploaded reports / scans become chart text before intake reads the chart
  if (at("intake")) {
    if (await readUploads(caseObj)) ({ patient, documents, policy } = context(caseObj));
  }

  // 1. Intake
  if (at("intake")) {
    caseObj.status = "INTAKE";
    emit(caseObj, "intake", "running", `Reading ${documents.length} chart document(s)…`);
    await pause();
    const { facts, rejected, mode, error } = await runIntake(documents);
    caseObj.facts = facts;
    caseObj.modes.intake = mode;
    emit(caseObj, "intake", "done", `Extracted ${facts.length} facts, all with verified source quotes${rejected ? ` (${rejected} unverifiable quotes rejected)` : ""}.`, { mode, error });
    agentAudit(caseObj, "intake.extracted", { facts: facts.length, rejected, mode });
  }

  // 2. Coding
  if (at("coding")) {
    emit(caseObj, "coding", "running", "Mapping order and diagnoses to CPT / ICD-10…");
    await pause();
    // The insurer is chosen per case (defaults to the patient's plan) so the same chart can be checked against different payers.
    caseObj.coding = runCoding({ order: caseObj.order, patient: { ...patient, payer: caseObj.order.payer || patient.payer }, documents });
    emit(caseObj, "coding", "done", `CPT ${caseObj.coding.cpt} · ICD-10 ${caseObj.coding.icd10.map((d) => d.code).join(", ") || "needs confirmation"} · ${caseObj.coding.payer}`, { mode: "rules" });
    agentAudit(caseObj, "coding.mapped", { cpt: caseObj.coding.cpt, icd10: caseObj.coding.icd10.map((d) => d.code) });

    // 2b. Coverage check against the real insurer's published plan terms (skipped for mock payers)
    caseObj.coverage = runCoverageCheck({ payer: caseObj.coding.payer, patient, coding: caseObj.coding, order: caseObj.order, documents });
    if (caseObj.coverage) {
      emit(caseObj, "coverage", "running", `Checking ${caseObj.coverage.plan} benefit terms…`);
      await pause();
      const cv = caseObj.coverage;
      emit(caseObj, "coverage", cv.status === "COVERED" ? "done" : "warning", `${cv.summary}${cv.blocker ? ` ${cv.blocker.detail}` : ""}`, { mode: "rules" });
      agentAudit(caseObj, "coverage.checked", { insurer: cv.insurerId, status: cv.status, blocker: cv.blocker?.rule || null });
    }
  }

  // 3. Policy retrieval
  if (at("policy")) {
    caseObj.status = "CRITERIA_CHECK";
    emit(caseObj, "policy", "running", `Retrieving ${caseObj.coding.payer} coverage policy for CPT ${caseObj.coding.cpt}…`);
    await pause();
    const r = await runPolicyRetrieval({ payer: caseObj.coding.payer, cpt: caseObj.coding.cpt, procedure: caseObj.coding.procedure, diagnoses: caseObj.coding.icd10 });
    if (!r.policy) {
      emit(caseObj, "policy", "error", "No coverage policy found for this payer and procedure.");
      caseObj.status = "ERROR";
      return touch(caseObj);
    }
    caseObj.policy = r.policy;
    caseObj.retrieved = r.retrieved;
    policy = getPolicy(r.policy.id);
    emit(caseObj, "policy", "done", `${r.policy.name}: ${r.criteria.length} criteria (${r.criteria.filter((c) => c.required).length} required). Top sections (${r.method === "embeddings" ? "bge-small semantic search" : "TF-IDF search"}): ${r.retrieved.slice(0, 3).map((x) => `§${x.ref}`).join(", ")}`, { mode: "rag" });
    agentAudit(caseObj, "policy.retrieved", { policyId: r.policy.id, sections: r.retrieved.map((x) => x.ref) });
  }

  // 4. Criteria matching
  if (at("matcher")) {
    emit(caseObj, "matcher", "running", "Matching each criterion to chart evidence…");
    await pause();
    const { results, mode, error } = await runMatcher(policy, documents, caseObj.decisions, matchContext(caseObj, patient));
    caseObj.criteria = results;
    caseObj.modes.matcher = mode;
    const count = (s) => results.filter((r) => r.status === s).length;
    emit(caseObj, "matcher", "done", `${count("MET")} met · ${count("MISSING")} missing · ${count("UNCLEAR")} unclear${count("NOT_APPLICABLE") ? ` · ${count("NOT_APPLICABLE")} N/A` : ""}`, { mode, error });
    agentAudit(caseObj, "matcher.completed", { results: results.map((r) => ({ id: r.criterionId, status: r.status, confidence: r.confidence })), mode });
  }

  // 5. Gap closing (pause point)
  if (at("gaps")) {
    const pendingDocs = db().documents.filter((d) => d.patientId === caseObj.patientId && !d.available && !d.upload);
    const open = runGapCloser({ policy, results: caseObj.criteria, decisions: caseObj.decisions, existingGaps: caseObj.gaps, pendingDocs });
    const coverageGap = coverageGapFor(caseObj);
    if (coverageGap) open.unshift(coverageGap);
    caseObj.gaps = [...caseObj.gaps.filter((g) => g.status !== "OPEN"), ...open];
    if (open.length) {
      recordPrediction(caseObj, "Before gap closure");
      caseObj.status = "NEEDS_INFO";
      emit(caseObj, "gap_closer", "waiting", `${open.length} documentation gap(s) found. This request would likely be denied as-is. Waiting on clinician.`, { gaps: open.map((g) => g.criterionId) });
      agentAudit(caseObj, "gap_closer.opened", { gaps: open.map((g) => ({ criterion: g.criterionId, role: g.assignedRole })) });
      return touch(caseObj);
    }
    emit(caseObj, "gap_closer", "done", "No open documentation gaps.");
  }

  // 6. Packet writing
  if (at("writer")) {
    caseObj.status = "PACKET_DRAFTING";
    emit(caseObj, "packet_writer", "running", "Drafting Letter of Medical Necessity and auth form…");
    await pause();
    const packet = await runPacketWriter({ patient, coding: caseObj.coding, order: caseObj.order, facts: caseObj.facts, results: caseObj.criteria, documents, policy, coverage: caseObj.coverage });
    caseObj.packet = { ...packet, version: (caseObj.packet?.version || 0) + 1, editedBy: null };
    caseObj.modes.writer = packet.mode;
    emit(caseObj, "packet_writer", "done", `Letter drafted with ${packet.citations.length} verified citations.`, { mode: packet.mode, error: packet.error });
    agentAudit(caseObj, "packet_writer.drafted", { citations: packet.citations.length, version: caseObj.packet.version, mode: packet.mode });
  }

  // 7. Insurer simulator ⇄ rebuttal
  if (at("insurer")) {
    caseObj.status = "ADVERSARIAL_REVIEW";
    emit(caseObj, "insurer_simulator", "running", `Simulated ${caseObj.coding.payer} reviewer is trying to deny the request…`);
    await pause();
    await runAdversarial(caseObj, policy);
  }

  // 8. Verifier with writer retries
  if (at("verifier")) {
    emit(caseObj, "verifier", "running", "Independent verifier auditing the packet…");
    await pause();
    await verifyWithRetries(caseObj, { patient, documents, policy });
  }

  // 9. Readiness score (rule-based) + experimental ML estimate
  if (at("predictor")) {
    emit(caseObj, "denial_predictor", "running", "Scoring packet readiness…");
    await pause();
    const p = recordPrediction(caseObj, "Final packet");
    const rd = caseObj.readiness;
    emit(caseObj, "denial_predictor", "done", `Readiness Score ${rd.score}/100${rd.fixes.length ? `. Top fix: ${rd.fixes[0].fix}` : ". Every criterion is documented."} (Experimental ML estimate: ${Math.round(p.probability * 100)}%.)`, { mode: "rules" });
    agentAudit(caseObj, "readiness.scored", { readiness: rd.score, mlEstimate: p.probability });
  }

  // 10. Human review (pause point)
  caseObj.status = "READY_FOR_REVIEW";
  caseObj.metrics.readyAt = new Date().toISOString();
  emit(caseObj, "human_review", "waiting", "Packet ready. Waiting for coordinator approval. Nothing is submitted without a human.");
  touch(caseObj);
}

/** Reads every uploaded file for this patient that has not been processed yet. Returns true if any were read. */
async function readUploads(caseObj) {
  const pending = db().documents.filter((d) => d.patientId === caseObj.patientId && d.upload?.status === "pending");
  if (!pending.length) return false;
  caseObj.status = "READING_REPORTS";
  emit(caseObj, "reader", "running", `Reading ${pending.length} uploaded report(s) and scan(s)…`);
  const procedure = resolveProcedure(caseObj.order).short;
  const patient = getPatient(caseObj.patientId);
  let ok = 0;
  for (const doc of pending) {
    const name = doc.upload.name;
    try {
      const ex = await extractText({ buffer: await readFile(doc.upload.fileId), name, mime: doc.upload.mime });
      if (!ex.text || ex.text.replace(/s/g, "").length < 20) throw new Error("no readable text found");
      doc.text = ex.text;
      if (ex.reportDate && /^d{4}-d{2}-d{2}$/.test(ex.reportDate)) doc.date = ex.reportDate;
      doc.analysis = await analyseText(ex.text, procedure, patient.name);
      if (doc.analysis.relevance?.clinical !== false) doc.analysis.documentType = ex.documentType || doc.analysis.documentType;
      doc.type = "uploaded_report";
      doc.title = `${doc.analysis.documentType}: ${name}`;
      doc.upload = { ...doc.upload, method: ex.method, pages: ex.pages || null, confidence: ex.confidence ?? null, legibility: ex.legibility || null, readAt: new Date().toISOString() };

      // Relevance gate: only clinical records of this patient may become evidence.
      const excluded = exclusionReason(doc.analysis, patient.name);
      if (excluded) {
        doc.available = false;
        doc.upload = { ...doc.upload, status: "excluded", excludedReason: excluded };
        emit(caseObj, "reader", "warning", `"${name}" was NOT added to the chart. ${excluded} A coordinator can add it anyway from the chart panel.`, { mode: doc.analysis.relevance.method });
        agentAudit(caseObj, "reader.excluded", { documentId: doc.id, file: name, reason: excluded });
        continue;
      }
      doc.available = true;
      doc.upload = { ...doc.upload, status: "read" };
      ok++;
      const lowQuality = (ex.confidence != null && ex.confidence < 60) || ex.legibility === "low";
      const offTopic = doc.analysis.relevance?.relevant === false;
      emit(
        caseObj,
        "reader",
        lowQuality || offTopic ? "warning" : "info",
        `"${name}": ${doc.analysis.documentType}, ${ex.method}. ${doc.analysis.keyFindings.length} key finding(s).${offTopic ? ` May not be relevant to ${procedure}: ${doc.analysis.relevance.reason}` : ""}${lowQuality ? " Low read quality: please check the transcription against the original." : ""}`,
        { mode: doc.analysis.method }
      );
      agentAudit(caseObj, "reader.extracted", { documentId: doc.id, file: name, method: ex.method, findings: doc.analysis.keyFindings.length });
    } catch (err) {
      doc.upload = { ...doc.upload, status: "failed", error: err.message };
      emit(caseObj, "reader", "warning", `Could not read "${name}": ${err.message}. Paste the text with "Add note" instead.`);
      agentAudit(caseObj, "reader.failed", { documentId: doc.id, file: name, error: err.message });
    }
  }
  emit(caseObj, "reader", ok ? "done" : "warning", `${ok} of ${pending.length} upload(s) added to the chart.`);
  touch(caseObj);
  return ok > 0;
}

async function runAdversarial(caseObj, policy) {
  const result = await runInsurerSimulator({ policy, results: caseObj.criteria, packet: caseObj.packet });
  caseObj.adversarial = result;
  caseObj.modes.insurer = result.mode;
  const added = result.rounds.flatMap((r) => r.objections).filter((o) => o.resolution.type === "EVIDENCE_ADDED").length;
  emit(
    caseObj,
    "insurer_simulator",
    result.status === "SURVIVED" ? "done" : "warning",
    result.status === "SURVIVED"
      ? `Survived simulated review: ${result.blockingRaised} blocking objection(s) raised and answered over ${result.rounds.length || 1} round(s)${added ? `, ${added} fixed with added evidence` : ""}.`
      : `${result.blockingRemaining} blocking objection(s) remain. The simulated payer would deny this request.`,
    { mode: result.mode }
  );
  agentAudit(caseObj, "insurer_simulator.completed", { status: result.status, rounds: result.rounds.length, objections: result.totalObjections, discardedInvalid: result.discardedInvalid });
}

async function verifyWithRetries(caseObj, { patient, documents, policy }) {
  let attempt = 0;
  let v;
  while (true) {
    v = await runVerifier({ packet: caseObj.packet, documents, results: caseObj.criteria, coding: caseObj.coding, patient });
    const fixable = v.issues.filter((i) => i.fixable);
    if (!fixable.length || attempt >= 2) break;
    attempt++;
    emit(caseObj, "verifier", "info", `Verifier found ${fixable.length} fixable issue(s). Sending back to the writer (retry ${attempt}/2).`);
    caseObj.packet = fixPacket(caseObj.packet, fixable, { results: caseObj.criteria });
  }
  caseObj.verifier = { ...v, retries: attempt };
  caseObj.modes.verifier = v.mode;
  emit(caseObj, "verifier", v.status === "FAIL" ? "warning" : "done", v.status === "PASS" ? `PASS: all ${v.checks.length} checks passed.` : v.status === "WARN" ? `PASS with ${v.issues.length} warning(s).` : `FAIL: ${v.issues.filter((i) => i.severity === "high").length} high-severity issue(s). Routed to the human reviewer.`, { mode: v.mode });
  agentAudit(caseObj, "verifier.completed", { status: v.status, issues: v.issues.map((i) => i.type), retries: attempt });
}

/** Who and what the evidence must support, for the LLM reviewer. */
function matchContext(caseObj, patient) {
  return { patientName: patient?.name, procedure: caseObj.coding?.procedure || resolveProcedure(caseObj.order).name, reason: caseObj.order.reason };
}

function recordPrediction(caseObj, label) {
  const model = db().model;
  const p = predict(model, featuresFromCase({ results: caseObj.criteria, verifier: caseObj.verifier, coding: caseObj.coding, packet: caseObj.packet }));
  const rd = readinessScore(caseObj.criteria, caseObj.policy ? getPolicy(caseObj.policy.id) : null, { coverage: caseObj.coverage, decisions: caseObj.decisions });
  caseObj.prediction = p;
  caseObj.readiness = rd;
  caseObj.predictionHistory.push({ label, probability: p.probability, readiness: rd.score, at: new Date().toISOString() });
  return p;
}

/** A non-covered benefit is not a documentation problem; the coordinator must decide how to proceed. */
function coverageGapFor(caseObj) {
  const cv = caseObj.coverage;
  if (!cv || cv.status !== "NOT_COVERED" || caseObj.decisions.COVERAGE) return null;
  const existing = caseObj.gaps.find((g) => g.criterionId === "COVERAGE" && g.status === "OPEN");
  if (existing) return existing;
  return {
    id: newId("G"),
    criterionId: "COVERAGE",
    criterionText: `Plan benefit: ${cv.plan}`,
    status: "OPEN",
    finding: "NOT_COVERED",
    question: `${cv.summary} The insurer would reject this request regardless of documentation.`,
    detail: `${cv.blocker.detail}${cv.blocker.quote ? ` Insurer wording: "${cv.blocker.quote}"` : ""} (Source: ${cv.sources[0].title})`,
    assignedRole: "coordinator",
    wouldBeDenied: true,
    denialClass: "NOT_A_COVERED_BENEFIT",
    suggestedDocs: [],
    actions: ["mark_not_applicable", "confirm_not_done"],
    actionLabels: { mark_not_applicable: cv.override ? "Written authorization obtained" : "Benefit confirmed by insurer", confirm_not_done: "Proceed anyway (expect denial)" },
    createdAt: new Date().toISOString(),
  };
}

/** Re-check the same chart against a different insurer's policy (the "same patient, different insurer" demo). */
export function changeInsurer(caseObj, payer, user) {
  if (!["DRAFT", "NEEDS_INFO", "READY_FOR_REVIEW", "ERROR", "REJECTED"].includes(caseObj.status)) throw new Error(`Cannot change insurer once the case is ${caseObj.status}`);
  const from = caseObj.order.payer;
  caseObj.order.payer = payer;
  // Reset everything derived from the old policy; keep human-added documents.
  Object.assign(caseObj, { policy: null, coverage: null, criteria: [], gaps: [], decisions: {}, packet: null, adversarial: null, verifier: null, prediction: null, readiness: null });
  emit(caseObj, "system", "info", `${user.name} changed the insurer from ${from} to ${payer}. Re-checking the same chart against the new policy.`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "case.insurer_changed", payload: { from, to: payer } });
  runInBackground(caseObj, "coding");
}

// ─────────────────────────── human actions ───────────────────────────

export async function resolveGap(caseObj, gapId, { action, title, text, documentId, documentIds, note }, user) {
  const gap = caseObj.gaps.find((g) => g.id === gapId);
  if (!gap || gap.status !== "OPEN") throw new Error("Gap not found or already resolved");
  const store = db();
  let resolution;
  if (action === "attach_document") {
    if (Array.isArray(documentIds) && documentIds.length) {
      const docs = store.documents.filter((d) => documentIds.includes(d.id) && d.patientId === caseObj.patientId && d.upload);
      if (!docs.length) throw new Error("Uploaded documents not found");
      resolution = `Uploaded ${docs.map((d) => `"${d.upload.name}"`).join(", ")}`;
    } else if (documentId) {
      const doc = store.documents.find((d) => d.id === documentId && d.patientId === caseObj.patientId);
      if (!doc) throw new Error("Document not found");
      doc.available = true;
      doc.attachedBy = user.name;
      resolution = `Attached "${doc.title}"`;
    } else {
      if (!text?.trim()) throw new Error("Document text is required");
      const doc = { id: newId("D"), patientId: caseObj.patientId, type: "uploaded", title: title?.trim() || "Uploaded record", date: new Date().toISOString().slice(0, 10), available: true, text: text.trim(), attachedBy: user.name };
      store.documents.push(doc);
      resolution = `Uploaded "${doc.title}"`;
    }
  } else if (action === "add_note") {
    if (!text?.trim()) throw new Error("Note text is required");
    const patient = getPatient(caseObj.patientId);
    store.documents.push({
      id: newId("D"),
      patientId: caseObj.patientId,
      type: "addendum",
      title: `Clinician Addendum (${user.name})`,
      date: new Date().toISOString().slice(0, 10),
      available: true,
      text: `CLINICIAN ADDENDUM\nPatient: ${patient.name}\nAuthor: ${user.name}\n\n${text.trim()}`,
      attachedBy: user.name,
    });
    resolution = "Added clinician addendum";
  } else if (action === "mark_not_applicable") {
    if (gap.criterionId) caseObj.decisions[gap.criterionId] = "na";
    resolution = `Marked not applicable${note ? `: ${note}` : ""}`;
  } else if (action === "confirm_not_done") {
    if (gap.criterionId) caseObj.decisions[gap.criterionId] = "not_done";
    resolution = "Confirmed not done. The criterion stays unmet.";
  } else {
    throw new Error("Unknown action");
  }
  gap.status = "RESOLVED";
  gap.resolution = { action, summary: resolution, by: user.name, at: new Date().toISOString() };
  emit(caseObj, "gap_closer", "info", `${user.name}: ${resolution} (${gap.criterionId || "reviewer request"})`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "gap.resolved", payload: { gapId, criterionId: gap.criterionId, action } });

  const stillOpen = caseObj.gaps.filter((g) => g.status === "OPEN");
  if (!stillOpen.length) {
    emit(caseObj, "gap_closer", "done", "All gaps addressed. Re-running the copilot with the new evidence.");
    runInBackground(caseObj, "intake");
  } else touch(caseObj);
}

/** A coordinator decides an excluded upload is valid evidence after all (e.g. the name is spelled differently). */
export function includeUpload(caseObj, documentId, user) {
  const doc = db().documents.find((d) => d.id === documentId && d.patientId === caseObj.patientId && d.upload?.status === "excluded");
  if (!doc) throw new Error("Excluded upload not found");
  doc.available = true;
  doc.upload = { ...doc.upload, status: "read", includedBy: user.name, includedAt: new Date().toISOString() };
  emit(caseObj, "reader", "info", `${user.name} added "${doc.upload.name}" to the chart despite the warning (${doc.upload.excludedReason}). Re-running the copilot.`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "upload.included_after_exclusion", payload: { documentId, reason: doc.upload.excludedReason } });
  runInBackground(caseObj, "intake");
}

export function skipGaps(caseObj, user) {
  for (const g of caseObj.gaps.filter((x) => x.status === "OPEN")) {
    if (g.criterionId) caseObj.decisions[g.criterionId] = "not_done";
    g.status = "RESOLVED";
    g.resolution = { action: "confirm_not_done", summary: "Proceeded without this evidence", by: user.name, at: new Date().toISOString() };
  }
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "gap.skipped_all" });
  runInBackground(caseObj, "writer");
}

export async function savePacket(caseObj, { letter }, user) {
  if (!caseObj.packet) throw new Error("No packet yet");
  caseObj.packet.letter = letter;
  caseObj.packet.version += 1;
  caseObj.packet.editedBy = user.name;
  const { patient, documents, policy } = context(caseObj);
  const v = await runVerifier({ packet: caseObj.packet, documents, results: caseObj.criteria, coding: caseObj.coding, patient });
  caseObj.verifier = { ...v, retries: 0 };
  recordPrediction(caseObj, `Edited v${caseObj.packet.version}`);
  emit(caseObj, "human_review", "info", `${user.name} edited the letter (v${caseObj.packet.version}). Verifier: ${v.status}.`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "packet.edited", payload: { version: caseObj.packet.version, verifier: v.status } });
  touch(caseObj);
  return caseObj;
}

export async function rerunAdversarial(caseObj, user) {
  const { policy } = context(caseObj);
  emit(caseObj, "insurer_simulator", "running", `${user.name} re-ran the simulated payer review…`);
  await runAdversarial(caseObj, policy);
  touch(caseObj);
}

export function approve(caseObj, user, { acknowledgeWarnings } = {}) {
  if (caseObj.status !== "READY_FOR_REVIEW") throw new Error(`Case is ${caseObj.status}, not ready for review`);
  if (caseObj.verifier?.status === "FAIL" && !acknowledgeWarnings) throw new Error("Verifier failed. Acknowledge the warnings to approve anyway.");
  caseObj.status = "APPROVED_BY_HUMAN";
  caseObj.approval = { by: user.name, at: new Date().toISOString(), acknowledgedWarnings: Boolean(acknowledgeWarnings) };
  caseObj.metrics.approvedAt = caseObj.approval.at;
  emit(caseObj, "human_review", "done", `Approved by ${user.name}.`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "packet.approved", payload: { version: caseObj.packet.version, acknowledgedWarnings: Boolean(acknowledgeWarnings) } });
  return submit(caseObj);
}

export function reject(caseObj, user, reason) {
  caseObj.status = "REJECTED";
  emit(caseObj, "human_review", "info", `Rejected by ${user.name}: ${reason || "no reason given"}`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "packet.rejected", payload: { reason } });
  touch(caseObj);
}

export function requestChanges(caseObj, user, note) {
  caseObj.gaps.push({
    id: newId("G"),
    criterionId: null,
    criterionText: "Reviewer request",
    status: "OPEN",
    finding: "REQUEST",
    question: note || "Please review and update the documentation.",
    detail: `Requested by ${user.name}`,
    assignedRole: "physician",
    wouldBeDenied: false,
    suggestedDocs: [],
    actions: ["attach_document", "add_note"],
    createdAt: new Date().toISOString(),
  });
  caseObj.status = "NEEDS_INFO";
  emit(caseObj, "human_review", "waiting", `${user.name} requested changes: ${note}`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "packet.changes_requested", payload: { note } });
  touch(caseObj);
}

export function submit(caseObj, { immediate = false } = {}) {
  const { patient, policy } = context(caseObj);
  caseObj.status = "SUBMITTED";
  caseObj.submission = { submittedAt: new Date().toISOString(), channel: "Payer portal (mock)", status: "PENDING" };
  emit(caseObj, "submission", "done", `Submitted to ${caseObj.coding.payer} portal (mock). Awaiting determination…`);
  audit({ caseId: caseObj.id, actorType: "system", actorId: "payer_portal", action: "submission.sent" });
  touch(caseObj);

  const finish = () => {
    const d = decide({ caseObj, policy, results: caseObj.criteria });
    caseObj.submission = { ...caseObj.submission, status: "DECIDED", decidedAt: new Date().toISOString(), payerReference: d.reference, decision: d.decision, decisionReason: d.reasonText };
    if (d.decision === "APPROVED") {
      caseObj.status = "APPROVED";
      caseObj.outcome = { decision: "APPROVED", at: caseObj.submission.decidedAt };
      emit(caseObj, "payer_decision", "done", `${caseObj.coding.payer} APPROVED the request (ref ${d.reference}).`);
    } else {
      caseObj.status = "DENIED";
      caseObj.denial = { ...d, letterText: denialLetter({ patient, policy, decision: d, coding: caseObj.coding }), receivedAt: caseObj.submission.decidedAt, source: "payer_portal" };
      caseObj.outcome = { decision: "DENIED", reasonClass: d.reasonClass, at: caseObj.submission.decidedAt };
      emit(caseObj, "payer_decision", "warning", `${caseObj.coding.payer} DENIED the request: ${d.reasonText}`);
    }
    audit({ caseId: caseObj.id, actorType: "system", actorId: "payer_portal", action: "submission.decided", payload: { decision: d.decision, reasonClass: d.reasonClass } });
    learn(caseObj);
    touch(caseObj);
  };
  if (immediate) finish();
  else setTimeout(finish, DECISION_DELAY);
  return caseObj;
}

export async function recordDenial(caseObj, { letterText }, user) {
  const policy = getPolicy(caseObj.policy.id);
  caseObj.status = "DENIED";
  caseObj.denial = { decision: "DENIED", reference: caseObj.submission?.payerReference || "MANUAL", reasonClass: null, reasonText: letterText.slice(0, 400), letterText, unmetCriteria: [], receivedAt: new Date().toISOString(), source: "manual" };
  caseObj.outcome = { decision: "DENIED", at: caseObj.denial.receivedAt };
  emit(caseObj, "payer_decision", "warning", `${user.name} recorded a denial letter.`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "denial.recorded" });
  learn(caseObj);
  await draftAppeal(caseObj);
  return caseObj;
}

export async function draftAppeal(caseObj) {
  const { patient, documents, policy } = context(caseObj);
  emit(caseObj, "appeal", "running", "Appeal agent reading the denial and searching the chart for counter-evidence…");
  await pause();
  const appeal = await runAppeal({ caseObj, patient, policy, documents, denial: caseObj.denial });
  caseObj.appeal = appeal;
  caseObj.denial.reasonClass ??= appeal.reasonClass;
  caseObj.status = "APPEAL_DRAFTED";
  emit(caseObj, "appeal", "done", `Denial classified as "${appeal.reasonLabel}". ${appeal.counterEvidence.filter((c) => c.status === "MET").length}/${appeal.counterEvidence.length} disputed criteria now supported. Peer-to-peer ${appeal.p2p.recommended ? "recommended" : "not needed"}.`, { mode: appeal.mode });
  agentAudit(caseObj, "appeal.drafted", { reasonClass: appeal.reasonClass, strength: appeal.strength });
  touch(caseObj);
  return caseObj;
}

export function saveAppeal(caseObj, { letter }, user) {
  caseObj.appeal.letter = letter;
  caseObj.appeal.editedBy = user.name;
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "appeal.edited" });
  touch(caseObj);
}

export async function submitAppeal(caseObj, user, { immediate = false } = {}) {
  if (!caseObj.appeal) throw new Error("No appeal drafted");
  caseObj.status = "APPEAL_SUBMITTED";
  caseObj.appeal.status = "SUBMITTED";
  caseObj.appeal.submittedBy = user.name;
  caseObj.appeal.submittedAt = new Date().toISOString();
  emit(caseObj, "appeal", "done", `${user.name} approved and submitted the appeal.`);
  audit({ caseId: caseObj.id, actorType: "human", actorId: user.email, action: "appeal.submitted" });
  touch(caseObj);

  const finish = async () => {
    const { patient, documents, policy } = context(caseObj);
    const { results } = await runMatcher(policy, documents, caseObj.decisions, matchContext(caseObj, patient));
    const d = decide({ caseObj, policy, results, isAppeal: true });
    caseObj.appeal.outcome = d.decision === "APPROVED" ? "OVERTURNED" : "UPHELD";
    caseObj.appeal.decidedAt = new Date().toISOString();
    caseObj.appeal.decisionReason = d.reasonText;
    caseObj.status = caseObj.appeal.outcome;
    caseObj.outcome = { ...caseObj.outcome, appealOutcome: caseObj.appeal.outcome };
    emit(caseObj, "payer_decision", caseObj.appeal.outcome === "OVERTURNED" ? "done" : "warning", `Appeal ${caseObj.appeal.outcome}: ${d.reasonText}`);
    audit({ caseId: caseObj.id, actorType: "system", actorId: "payer_portal", action: "appeal.decided", payload: { outcome: caseObj.appeal.outcome } });
    learn(caseObj);
    touch(caseObj);
  };
  if (immediate) await finish();
  else setTimeout(() => finish().catch(console.error), DECISION_DELAY);
}

/** 12. Learning loop: log the outcome as a training example for the predictor. */
function learn(caseObj) {
  const store = db();
  const features = featuresFromCase({ results: caseObj.criteria, verifier: caseObj.verifier, coding: caseObj.coding, packet: caseObj.packet });
  const existing = store.history.find((h) => h.caseId === caseObj.id);
  const entry = {
    id: existing?.id || `L-${caseObj.id}`,
    caseId: caseObj.id,
    source: "live",
    date: new Date().toISOString().slice(0, 10),
    payer: caseObj.coding.payer,
    cpt: caseObj.coding.cpt,
    features,
    decision: caseObj.submission?.decision || caseObj.outcome?.decision,
    denialReason: caseObj.denial?.reasonClass || null,
    allRequiredMet: features.met_ratio === 1,
    appealed: Boolean(caseObj.appeal?.submittedAt),
    appealOutcome: caseObj.appeal?.outcome || null,
    predicted: caseObj.prediction?.probability ?? null,
    copilot: true,
  };
  if (existing) Object.assign(existing, entry);
  else store.history.push(entry);
  emit(caseObj, "learning", "info", "Outcome logged to the learning loop (used at the next predictor retrain).");
  save();
}

// End-to-end self-test: builds a fresh demo database in a temporary file (your real data is never
// touched), then exercises every agent, workflow path and edge case with the offline rule engine.
//   npm test
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

const TMP = path.join(os.tmpdir(), `pac-selftest-${Date.now()}.json`);
process.env.DB_FILE = TMP;
process.env.AI_MODE = "heuristic";
process.env.STEP_DELAY_MS = "0";
process.env.PIPELINE_STEP_DELAY_MS = "0";
process.env.PAYER_DECISION_DELAY_MS = "5";
process.env.EMBEDDINGS = "off";
// Empty (not deleted): dotenv never overrides a defined variable, so backend/.env cannot point the
// self-test at your real MongoDB, which seeding would wipe.
process.env.MONGODB_URI = "";
const UPLOADS = path.join(os.tmpdir(), `pac-selftest-uploads-${Date.now()}`);
process.env.UPLOAD_DIR = UPLOADS;

const { initDb, db, getCase, flush } = await import("./db.js");
const { seed } = await import("./seed.js");
const wf = await import("./agents/workflow.js");
const { PATIENTS, DOCUMENTS } = await import("./data/patients.js");
const { POLICIES, PAYERS, findPolicy } = await import("./data/policies.js");
const { saveFile } = await import("./files.js");
const { extractText, isSupported } = await import("./agents/reader.js");
const { PDFDocument, StandardFonts } = await import("pdf-lib");
const { INSURERS, REAL_PAYERS } = await import("./data/insurers.js");
const { runMatcher } = await import("./agents/matcher.js");
const { runCoding } = await import("./agents/coding.js");
const { runCoverageCheck } = await import("./agents/coverage.js");
const { buildIndex, search } = await import("./agents/policyRag.js");
const { runEvaluation } = await import("./evaluate.js");
const { packetPdf } = await import("./pdf.js");

const results = [];
const check = (group, name, ok, detail = "") => results.push({ group, name, ok: Boolean(ok), detail });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const priya = { name: "Priya Sharma", email: "priya@demo.health" };
const khan = { name: "Dr. Imran Khan", email: "khan@demo.health" };

async function settle(c, statuses = ["NEEDS_INFO", "READY_FOR_REVIEW", "ERROR"]) {
  for (let i = 0; i < 400; i++) {
    await sleep(15);
    if (statuses.includes(c.status) && c.timeline.at(-1)?.status !== "running") return c;
  }
  return c;
}
const crit = (c, id) => c.criteria.find((r) => r.criterionId === id)?.status;
const openGap = (c, id) => c.gaps.find((g) => g.status === "OPEN" && (id === undefined || g.criterionId === id));

await initDb();
await seed({ quiet: true });
buildIndex();

// ── 1. Criteria matching on every patient chart (hand-labeled expectations) ──
const EXPECTED = {
  P001: "MET MET MET MET MET", P002: "MET MISSING MET MET MET", P003: "MET MET MET MET MISSING", P004: "MET MET MET MISSING MISSING",
  P005: "MET UNCLEAR MET MET MISSING", P006: "MET MISSING MET MISSING MET", P007: "MET UNCLEAR MET MET MET", P008: "MET MET MET MET MET",
  P009: "MET MISSING MET MET MET", P010: "MET MET MET MISSING MET", P011: "MET MET MET MET MISSING", P012: "MET MET MET MET MET",
  P013: "MET MET MET MET MISSING", P014: "MET MET MISSING MET MET", P015: "MET UNCLEAR MET MET MET", P016: "MET MET MET MET MET",
  P017: "MET MET MET MET MET", P018: "MET MISSING MISSING MET MET", P019: "MET MET MISSING MET MET", P020: "MET MET MET MET MET",
};
for (const p of PATIENTS) {
  const policy = findPolicy(POLICIES, p.payer, p.defaultOrder.cpt);
  const docs = DOCUMENTS.filter((d) => d.patientId === p.id && d.available);
  const { results: r } = await runMatcher(policy, docs);
  const got = r.map((x) => x.status).join(" ");
  check("Criteria matching", `${p.id} ${p.name} (${p.scenario.slice(0, 48)}…)`, got === EXPECTED[p.id], got === EXPECTED[p.id] ? "" : `expected ${EXPECTED[p.id]}, got ${got}`);
}

// ── 2. Coding (uncertain-diagnosis rule, missing codes) ──
const code = (pid) => runCoding({ order: PATIENTS.find((p) => p.id === pid).defaultOrder, patient: PATIENTS.find((p) => p.id === pid), documents: DOCUMENTS.filter((d) => d.patientId === pid && d.available) }).icd10.map((d) => d.code);
check("Coding", "Suspected disc herniation is not coded (P004 has no M51.26)", !code("P004").includes("M51.26"), code("P004").join(","));
check("Coding", "'Rule out meniscal tear' is not coded (P015 has no M23.91)", !code("P015").includes("M23.91"), code("P015").join(","));
check("Coding", "Confirmed foot drop is coded (P004 M21.371)", code("P004").includes("M21.371"));
check("Coding", "Uncodable diagnosis yields no code (P016)", code("P016").length === 0);

// ── 3. Coverage check against real insurer plan terms ──
const P001 = PATIENTS.find((p) => p.id === "P001");
const cov = (payer, patient = P001, setting = "outpatient", pid = "P001") =>
  runCoverageCheck({ payer, patient, coding: { procedureShort: "Knee MRI" }, order: { setting }, documents: DOCUMENTS.filter((d) => d.patientId === pid && d.available) });
const EXPECT_COV = { "Jubilee Life (Royale Plan)": "NOT_COVERED", "EFU Life (Mukammal Sehat)": "COVERED", "State Life (Sahara Family Health)": "CONDITIONAL", "Adamjee Insurance (Health)": "NOT_COVERED", "Sehat Card Plus (KP Government)": "NOT_COVERED" };
for (const [payer, want] of Object.entries(EXPECT_COV)) check("Coverage check", `Outpatient knee MRI under ${payer} → ${want}`, cov(payer)?.status === want, cov(payer)?.status);
check("Coverage check", "Jubilee covers the MRI during an inpatient admission", cov("Jubilee Life (Royale Plan)", P001, "inpatient")?.status === "COVERED");
const ghulam = cov("Adamjee Insurance (Health)", PATIENTS.find((p) => p.id === "P012"), "outpatient", "P012");
check("Coverage check", "Age 63 fails Adamjee's age limit of 60 (P012)", ghulam.findings.some((f) => f.rule === "Age limit" && f.result === "FAIL"));
const nadia = cov("EFU Life (Mukammal Sehat)", PATIENTS.find((p) => p.id === "P013"), "outpatient", "P013");
check("Coverage check", "Cancer history makes EFU coverage CONDITIONAL (P013)", nadia.status === "CONDITIONAL");
check("Coverage check", "Mock payers have no coverage check", cov("BlueRiver Health") === null);

// ── 4. Insurer data integrity and honesty rules ──
check("Insurer data", "Every real insurer cites an https source with a retrieval date", INSURERS.every((i) => i.sources.length && i.sources.every((s) => s.url.startsWith("https://") && s.retrieved)));
check("Insurer data", "Every real insurer has knee and lumbar policies", REAL_PAYERS.every((p) => POLICIES.some((x) => x.payer === p && x.cpts.includes("73721")) && POLICIES.some((x) => x.payer === p && x.cpts.includes("72148"))));
check("Insurer data", "Real insurer clinical criteria are labeled demo", POLICIES.filter((p) => p.real).every((p) => p.sections.filter((s) => s.title.startsWith("Criterion")).every((s) => s.title.includes("demo"))));
check("Insurer data", "Synthetic outcome history never uses a real company", db().history.filter((h) => h.source === "synthetic").every((h) => !REAL_PAYERS.includes(h.payer)));
check("Insurer data", `All ${PAYERS.length} payers are selectable`, PAYERS.length === 9);

// ── 5. Seeded demo cases (one per status / outcome) ──
const SEEDED = {
  "C-1001": "APPROVED", "C-1002": "APPEAL_DRAFTED", "C-1003": "NEEDS_INFO", "C-1004": "READY_FOR_REVIEW", "C-1005": "APPEAL_DRAFTED",
  "C-1006": "NEEDS_INFO", "C-1007": "READY_FOR_REVIEW", "C-1008": "APPEAL_DRAFTED", "C-1009": "READY_FOR_REVIEW", "C-1010": "REJECTED",
};
for (const [id, status] of Object.entries(SEEDED)) check("Seeded cases", `${id} ${getCase(id)?.patientName} is ${status}`, getCase(id)?.status === status, getCase(id)?.status);
check("Seeded cases", "C-1006 has an open COVERAGE gap", openGap(getCase("C-1006"), "COVERAGE"));
check("Seeded cases", "C-1007 coverage is CONDITIONAL", getCase("C-1007").coverage?.status === "CONDITIONAL");
check("Seeded cases", "C-1008 was denied 'not medically necessary' despite full documentation", getCase("C-1008").denial?.reasonClass === "NOT_MEDICALLY_NECESSARY");
check("Seeded cases", "C-1009 verifier catches the misfiled record (identity mismatch)", getCase("C-1009").verifier?.issues.some((i) => i.type === "IDENTITY_MISMATCH"));
check("Seeded cases", "C-1010 verifier flags the missing ICD-10 code", getCase("C-1010").verifier?.issues.some((i) => i.type === "CODING"));

// ── 6. Gap closing re-runs the copilot ──
let c = wf.createCase({ patientId: "P002", order: { cpt: "73721", reason: "Left knee instability" }, user: priya });
await wf.runFrom(c);
check("Gap closing", "P002: missing PT creates a gap (K2)", openGap(c, "K2"));
const before = c.readiness?.score;
await wf.resolveGap(c, openGap(c, "K2").id, { action: "attach_document", documentId: "D002-2" }, khan);
await settle(c, ["READY_FOR_REVIEW"]);
check("Gap closing", `Attaching the outside PT record: readiness ${before} → ${c.readiness?.score}, case ready`, c.status === "READY_FOR_REVIEW" && crit(c, "K2") === "MET" && c.readiness.score > before);

c = wf.createCase({ patientId: "P005", order: { cpt: "72148", reason: "Chronic low back pain" }, user: priya });
await wf.runFrom(c);
const lumbarGaps = c.gaps.filter((g) => g.status === "OPEN").length;
await wf.resolveGap(c, openGap(c, "L2").id, { action: "add_note", text: "Patient completed 7 weeks of physical therapy from March to April with no improvement." }, khan);
await wf.resolveGap(c, openGap(c, "L5").id, { action: "mark_not_applicable" }, priya);
await settle(c, ["READY_FOR_REVIEW"]);
check("Gap closing", `Clinician note + N/A resolve ${lumbarGaps} gaps on P005`, c.status === "READY_FOR_REVIEW" && crit(c, "L2") === "MET" && crit(c, "L5") === "NOT_APPLICABLE");

// ── 7. Same patient, different insurer ──
c = wf.createCase({ patientId: "P009", order: { cpt: "73721", reason: "Suspected meniscal tear", payer: "BlueRiver Health" }, user: priya });
await wf.runFrom(c);
check("Insurer switch", "P009 on BlueRiver (needs 6 weeks): K2 MISSING, readiness capped at 60", crit(c, "K2") === "MISSING" && c.readiness.score <= 60 && c.readiness.capped);
wf.changeInsurer(c, "Indus Health", priya);
await sleep(30);
await settle(c, ["READY_FOR_REVIEW", "NEEDS_INFO"]);
check("Insurer switch", "Same chart on Indus Health (needs 4 weeks): K2 MET, readiness 100", crit(c, "K2") === "MET" && c.readiness.score === 100);
wf.changeInsurer(c, "EFU Life (Mukammal Sehat)", priya);
await sleep(30);
await settle(c);
check("Insurer switch", "Switching to a real insurer runs the coverage check (EFU → COVERED)", c.coverage?.status === "COVERED");

// ── 8. Non-covered benefits ──
c = getCase("C-1006");
check("Coverage workflow", "Non-covered benefit caps readiness at 40", c.readiness.score <= 40 && c.readiness.level === "NOT_READY");
await wf.resolveGap(c, openGap(c, "COVERAGE").id, { action: "mark_not_applicable" }, priya);
await settle(c, ["READY_FOR_REVIEW"]);
check("Coverage workflow", "'Written authorization obtained' lets the case proceed", c.status === "READY_FOR_REVIEW" && c.readiness.score > 40);
wf.approve(c, priya, { acknowledgeWarnings: true });
await settle(c, ["APPROVED", "DENIED"]);
check("Coverage workflow", "With authorization recorded, the payer approves", c.status === "APPROVED", c.status);

c = wf.createCase({ patientId: "P012", order: { cpt: "73721", reason: "Suspected meniscal tear" }, user: priya });
await wf.runFrom(c);
await wf.resolveGap(c, openGap(c, "COVERAGE").id, { action: "confirm_not_done" }, priya);
await settle(c, ["READY_FOR_REVIEW"]);
wf.approve(c, priya, { acknowledgeWarnings: true });
await settle(c, ["APPROVED", "DENIED"]);
check("Coverage workflow", "'Proceed anyway' is denied as NOT_A_COVERED_BENEFIT", c.status === "DENIED" && c.denial?.reasonClass === "NOT_A_COVERED_BENEFIT", c.denial?.reasonClass);

// ── 9. Human review safeguards ──
c = getCase("C-1009");
let threw = false;
try {
  wf.approve(c, priya, {});
} catch {
  threw = true;
}
check("Human review", "Approving a verifier FAIL without acknowledging warnings is blocked", threw && c.status === "READY_FOR_REVIEW");
wf.approve(c, priya, { acknowledgeWarnings: true });
check("Human review", "Approving with acknowledgement submits the case", ["SUBMITTED", "APPROVED", "DENIED"].includes(c.status));

c = getCase("C-1004");
const original = c.packet.letter;
await wf.savePacket(c, { letter: original.replace("## Medical Necessity", "- Patient also failed 12 weeks of chiropractic care.\n\n## Medical Necessity") }, priya);
check("Human review", "Editing in an uncited clinical claim makes the verifier FAIL", c.verifier.status === "FAIL" && c.verifier.issues.some((i) => i.type === "UNCITED_CLAIM"));
await wf.savePacket(c, { letter: original }, priya);
check("Human review", "Removing the claim restores a passing verifier", c.verifier.status !== "FAIL", c.verifier.status);

c = getCase("C-1007");
wf.requestChanges(c, priya, "Please confirm the cancer history is unrelated to the current back pain.");
check("Human review", "Request changes sends the case back with a reviewer gap", c.status === "NEEDS_INFO" && openGap(c, null));
await wf.resolveGap(c, openGap(c, null).id, { action: "add_note", text: "Breast cancer treated in 2019, in remission; MRI requested to exclude recurrence." }, khan);
await settle(c, ["READY_FOR_REVIEW", "NEEDS_INFO"]);
check("Human review", "Physician answer re-runs the copilot", ["READY_FOR_REVIEW", "NEEDS_INFO"].includes(c.status));

// ── 10. Appeals ──
for (const [id, want, label] of [
  ["C-1002", "OVERTURNED", "late PT records support the appeal"],
  ["C-1005", "UPHELD", "records still missing"],
  ["C-1008", "OVERTURNED", "fully documented case wrongly denied"],
]) {
  const a = getCase(id);
  await wf.submitAppeal(a, priya, { immediate: true });
  check("Appeals", `${id} appeal ${want} (${label})`, a.status === want, a.status);
}

// ── 11. Any procedure, not only imaging ──
check("Any procedure", "Every payer has a general policy for procedures without a specific one", PAYERS.every((p) => findPolicy(POLICIES, p, "CUSTOM")?.cpts.includes("*")));
c = wf.createCase({ patientId: "P001", order: { cpt: "CUSTOM", procedureName: "Tonsillectomy", kind: "therapeutic", setting: "inpatient", reason: "Recurrent tonsillitis" }, user: priya });
await wf.runFrom(c);
check("Any procedure", "A typed (custom) procedure is checked against the payer's general policy", c.policy?.id === "BRH-GENERAL" && c.criteria.length === 5, c.policy?.id);
c = wf.createCase({ patientId: "P018", order: { cpt: "92928", reason: "Exertional chest pain" }, user: priya });
await wf.runFrom(c);
check("Any procedure", "PCI without a stress test opens a gap (CI2)", openGap(c, "CI2"));
await wf.resolveGap(c, openGap(c, "CI2").id, { action: "attach_document", documentId: "D018-2" }, khan);
await wf.resolveGap(c, openGap(c, "CI3").id, { action: "confirm_not_done" }, khan);
await settle(c, ["READY_FOR_REVIEW", "NEEDS_INFO"]);
check("Any procedure", "Attaching the stress test report meets CI2 (medication gap remains)", crit(c, "CI2") === "MET" && crit(c, "CI3") === "MISSING", `${crit(c, "CI2")} ${crit(c, "CI3")}`);
c = wf.createCase({ patientId: "P019", order: { cpt: "27447", reason: "Severe osteoarthritis right knee" }, user: priya });
await wf.runFrom(c);
const tkaBefore = crit(c, "J3");
wf.changeInsurer(c, "Indus Health", priya);
await sleep(30);
await settle(c, ["READY_FOR_REVIEW", "NEEDS_INFO"]);
check("Any procedure", `Knee replacement: 8 weeks physio is ${tkaBefore} on Medicare (12), ${crit(c, "J3")} on Indus Health (6)`, tkaBefore === "MISSING" && crit(c, "J3") === "MET");
const P020 = PATIENTS.find((p) => p.id === "P020");
const bariatricCov = runCoverageCheck({ payer: "Jubilee Life (Royale Plan)", patient: P020, coding: { procedureShort: "Laparoscopic gastric bypass", benefit: "inpatient", family: "bariatric" }, order: { setting: "inpatient" }, documents: DOCUMENTS.filter((d) => d.patientId === "P020") });
check("Any procedure", "Jubilee excludes obesity surgery (plan exclusion → NOT_COVERED)", bariatricCov.status === "NOT_COVERED" && bariatricCov.findings.some((f) => f.rule === "Plan exclusion"));
const cabgCov = runCoverageCheck({ payer: "EFU Life (Mukammal Sehat)", patient: PATIENTS.find((p) => p.id === "P017"), coding: { procedureShort: "CABG", benefit: "inpatient", family: "cardiac_surgery" }, order: { setting: "inpatient" }, documents: [] });
check("Any procedure", "Heart surgery is an inpatient benefit under EFU (COVERED)", cabgCov.status === "COVERED", cabgCov.status);

// ── 12. Uploaded reports and scans ──
check("Uploads", "Unsupported file types are rejected (zip)", !isSupported("application/zip") && isSupported("application/pdf") && isSupported("image/jpeg"));
const pdfDoc = await PDFDocument.create();
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const page = pdfDoc.addPage();
["ECHOCARDIOGRAM REPORT", "Patient: Maria Lopez   Date: 09/28/2026", "Left ventricular ejection fraction is 35%, reduced.", "Moderate mitral regurgitation is present.", "Impression: Reduced systolic function."].forEach((line, i) => page.drawText(line, { x: 50, y: 760 - i * 20, size: 12, font }));
const pdfBytes = Buffer.from(await pdfDoc.save());
const ex = await extractText({ buffer: pdfBytes, name: "echo.pdf", mime: "application/pdf" });
check("Uploads", `Digital PDF text is extracted (${ex.method})`, ex.method === "PDF text layer" && /ejection fraction is 35%/.test(ex.text), ex.text.slice(0, 60));
const store = db();
for (const [name, mime, buffer] of [["echo.pdf", "application/pdf", pdfBytes], ["lab.txt", "text/plain", Buffer.from("LAB REPORT\nPatient: Maria Lopez\nHemoglobin 9.8 g/dL (low).\nCreatinine 1.1 mg/dL.")]]) {
  const fileId = await saveFile({ buffer, name, mime, patientId: "P001" });
  store.documents.push({ id: `D-test-${name}`, patientId: "P001", type: "upload", title: name, date: "2026-10-10", available: false, text: "", upload: { fileId, name, mime, size: buffer.length, status: "pending" } });
}
c = wf.createCase({ patientId: "P001", order: { cpt: "73721", reason: "Suspected medial meniscal tear" }, user: priya });
await wf.runFrom(c);
const echo = store.documents.find((d) => d.id === "D-test-echo.pdf");
const lab = store.documents.find((d) => d.id === "D-test-lab.txt");
check("Uploads", "Report Reader adds uploaded files to the chart before intake", echo.available && lab.available && c.timeline.some((t) => t.step === "reader" && t.status === "done"));
check("Uploads", `Report analysis: "${echo.analysis?.documentType}", ${echo.analysis?.keyFindings.length} grounded finding(s)`, echo.analysis?.documentType === "Echocardiogram" && echo.analysis.keyFindings.every((f) => echo.text.includes(f.quote)));
check("Uploads", "Decimal lab values stay in one sentence (Hemoglobin 9.8)", c.facts.some((f) => f.evidence_quote.includes("Hemoglobin 9.8 g/dL")));

// Irrelevant uploads must never become evidence (regression: a project presentation once scored 50%+).
const IRRELEVANT = "FROM PROJECT TO PROFESSION\nHow your Final Year Project becomes your first real engineering role.\nBring concrete examples to discuss with recommenders, forecasting, MLOps.\nMake a plan, set milestones, and present results to the panel.\nThe report shows what you learned.";
const OTHER_PATIENT = "LAB REPORT\nPatient: Zubair Hassan   DOB: 02/02/1970\nHemoglobin 13.9 g/dL. Creatinine 0.9 mg/dL. Glucose 92 mg/dL within the normal range.\nImpression: normal blood counts and kidney function.";
for (const [id, name, text] of [["D-test-fyp", "fyp-presentation.txt", IRRELEVANT], ["D-test-other", "other-patient-lab.txt", OTHER_PATIENT]]) {
  const buffer = Buffer.from(text);
  const fileId = await saveFile({ buffer, name, mime: "text/plain", patientId: "P016" });
  store.documents.push({ id, patientId: "P016", type: "upload", title: name, date: "2026-10-10", available: false, text: "", upload: { fileId, name, mime: "text/plain", size: buffer.length, status: "pending" } });
}
c = wf.createCase({ patientId: "P016", order: { cpt: "CUSTOM", procedureName: "Colonoscopy", setting: "day_care", reason: "Gastro symptoms" }, user: priya });
await wf.runFrom(c);
const fyp = store.documents.find((d) => d.id === "D-test-fyp");
const other = store.documents.find((d) => d.id === "D-test-other");
check("Relevance gate", "A non-clinical upload (project presentation) is kept out of the chart", fyp.upload.status === "excluded" && !fyp.available && !c.criteria.some((r) => r.evidence.some((e) => e.docId === fyp.id)), fyp.upload.excludedReason);
check("Relevance gate", "A report naming a different patient is kept out of the chart", other.upload.status === "excluded" && /Zubair Hassan/.test(other.upload.excludedReason), other.upload.excludedReason);
wf.includeUpload(c, other.id, priya);
await settle(c, ["READY_FOR_REVIEW", "NEEDS_INFO"]);
check("Relevance gate", "A coordinator can add an excluded upload anyway (audited)", other.available && db().audit.some((a) => a.action === "upload.included_after_exclusion"));
const keywordOnly = [{ id: "X1", title: "Notes", date: "2026-10-10", text: IRRELEVANT }];
const { results: generic } = await runMatcher(findPolicy(POLICIES, "Indus Health", "CUSTOM"), keywordOnly);
check("Relevance gate", "Keyword-only text (\"examples\", \"recommenders\", \"plan\") meets no general criterion", generic.every((r) => r.status === "MISSING"), generic.map((r) => `${r.criterionId}=${r.status}`).join(" "));

// ── 13. Readiness, evaluation, retrieval, PDF, audit ──
check("Readiness", "Label is never READY while a required criterion is unmet (C-1003)", getCase("C-1003").readiness.level !== "READY");
const ev = await runEvaluation({ forceRules: true });
check("Evaluation", `6-case evaluation: accuracy ${ev.metrics.criteriaCorrect}/${ev.metrics.criteriaTotal}, grounding ${ev.metrics.verifiedQuotes}/${ev.metrics.citedQuotes}, recall ${ev.metrics.caughtGaps}/${ev.metrics.plantedGaps}`, ev.metrics.criteriaAccuracy === 1 && ev.metrics.groundingRate === 1 && ev.metrics.gapRecall === 1 && ev.metrics.insurerEffect);
const hits = search("physical therapy weeks failed", { payer: "BlueRiver Health", cpt: "73721", limit: 3 });
check("Policy retrieval", "Search finds the PT criterion section first (§3.2)", hits[0]?.ref === "3.2", hits.map((h) => h.ref).join(","));
const pdf = Buffer.from(await packetPdf(getCase("C-1004"), PATIENTS.find((p) => p.id === "P001")));
check("PDF export", `Packet PDF generated (${pdf.length} bytes)`, pdf.subarray(0, 5).toString() === "%PDF-");
const auditFirst = JSON.stringify(db().audit[0]);
check("Audit log", `Append-only audit trail recorded ${db().audit.length} entries; first entry unchanged`, db().audit.length > 100 && JSON.stringify(db().audit[0]) === auditFirst);

// ── report ──
await flush();
fs.rmSync(TMP, { force: true });
fs.rmSync(UPLOADS, { recursive: true, force: true });
let group = "";
for (const r of results) {
  if (r.group !== group) {
    group = r.group;
    console.log(`\n${group}`);
  }
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}${!r.ok && r.detail ? `  →  ${r.detail}` : ""}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed${failed ? `, ${failed} FAILED` : ""}`);
process.exit(failed ? 1 : 0);

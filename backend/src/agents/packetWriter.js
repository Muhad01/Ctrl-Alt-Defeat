// 6. Packet Writer — drafts the Letter of Medical Necessity and the auth form.
// Every clinical sentence carries an inline citation [n] that links to a verified chart quote.
import { validateQuote } from "../utils/text.js";
import { callJSON, withFallback } from "../llm.js";

const today = () => new Date().toISOString().slice(0, 10);

const SITE_OF_SERVICE = { outpatient_imaging: "Outpatient diagnostic center", inpatient: "Inpatient hospital", day_care: "Day-care / ambulatory procedure unit" };

/** Default Medical Necessity sentence: a test establishes a diagnosis, a treatment addresses one. */
function necessityStatement(coding) {
  return coding.kind === "treatment" || coding.kind === "therapeutic"
    ? `The requested ${coding.procedureShort} is the appropriate next step in treating the documented condition.`
    : `The requested ${coding.procedureShort} is needed to establish a definitive diagnosis and guide the next step in management.`;
}

/** Builds a citation registry that de-duplicates quotes. */
function citationRegistry(documents) {
  const citations = [];
  const cite = (ev) => {
    if (!ev?.quote) return null;
    const hit = validateQuote(documents, ev.docId, ev.quote);
    if (!hit) return null;
    const existing = citations.find((c) => c.quote === hit.quote && c.docId === hit.docId);
    if (existing) return existing.n;
    const n = citations.length + 1;
    citations.push({ n, quote: hit.quote, docId: hit.docId, docTitle: hit.docTitle, start: hit.start, end: hit.end });
    return n;
  };
  return { citations, cite };
}

function header(ctx) {
  const { patient, coding, policy } = ctx;
  return [
    "# Letter of Medical Necessity",
    "",
    `**Date:** ${today()}`,
    `**To:** ${coding.payer}, Utilization Management`,
    `**Re:** Prior authorization request for ${coding.procedure} (CPT ${coding.cpt})`,
    `**Patient:** ${patient.name} | DOB ${patient.dob} | Member ID ${coding.memberId}`,
    `**Diagnoses:** ${coding.icd10.map((d) => `${d.code} ${d.desc}`).join("; ") || "See clinical summary"}`,
    `**Ordering provider:** ${patient.provider.name}, ${patient.provider.specialty} (NPI ${patient.provider.npi})`,
    `**Applicable policy:** ${policy.name} (${policy.id} ${policy.version})`,
    ...(ctx.coverage ? [`**Plan benefit check:** ${ctx.coverage.summary} (per ${ctx.coverage.sources[0].title})`] : []),
    "",
  ];
}

function footer(ctx) {
  const { patient, coding } = ctx;
  return [
    "## Request",
    `We respectfully request authorization of CPT ${coding.cpt}. The attached records support each applicable policy criterion listed above. Please contact our office for any additional information or to schedule a peer-to-peer discussion.`,
    "",
    "Sincerely,",
    "",
    `${patient.provider.name}`,
    `${patient.provider.specialty} | NPI ${patient.provider.npi}`,
  ];
}

function ruleWrite(ctx) {
  const { patient, coding, order, facts, results, documents } = ctx;
  const { citations, cite } = citationRegistry(documents);
  const criteriaCitations = {};
  const lines = header(ctx);

  const dx = coding.icd10[0];
  const dxCite = dx ? cite({ quote: dx.evidence, docId: dx.docId }) : null;
  lines.push("## Clinical Summary");
  lines.push(
    `${patient.name} is a ${patient.age}-year-old ${patient.sex === "F" ? "female" : "male"} referred for a ${coding.procedureShort}. Working diagnosis: ${order.reason}${dxCite ? ` [${dxCite}]` : ""}.`
  );
  const byCat = (cat, n) => facts.filter((f) => f.category === cat).slice(0, n);
  for (const f of byCat("symptom", 2)) {
    const n = cite({ quote: f.evidence_quote, docId: f.source.doc_id });
    if (n) lines.push(`- ${f.evidence_quote} [${n}]`);
  }
  lines.push("");

  const treatments = [...byCat("prior_treatment", 3), ...byCat("medication", 2)];
  if (treatments.length) {
    lines.push("## Treatment History");
    const seen = new Set();
    for (const f of treatments) {
      if (seen.has(f.evidence_quote)) continue;
      seen.add(f.evidence_quote);
      const n = cite({ quote: f.evidence_quote, docId: f.source.doc_id });
      if (n) lines.push(`- ${f.evidence_quote} [${n}]`);
    }
    lines.push("");
  }

  const findings = [...byCat("exam_finding", 3), ...byCat("imaging", 2), ...byCat("test_result", 3), ...byCat("red_flag", 2)];
  if (findings.length) {
    lines.push("## Examination and Investigations");
    for (const f of findings) {
      const n = cite({ quote: f.evidence_quote, docId: f.source.doc_id });
      if (n) lines.push(`- ${f.evidence_quote} [${n}]`);
    }
    lines.push("");
  }

  // The first draft covers required criteria; the Insurer Simulator pushes for supporting ones.
  lines.push(`## Policy Criteria Met (${ctx.policy.id})`);
  for (const r of results.filter((x) => x.status === "MET" && x.required)) {
    const ns = r.evidence.map((e) => cite(e)).filter(Boolean);
    if (!ns.length) continue;
    criteriaCitations[r.criterionId] = ns;
    lines.push(`- **${r.criterionId}, ${r.text}:** "${r.evidence[0].quote}" ${ns.map((n) => `[${n}]`).join("")}`);
  }
  lines.push("");

  lines.push("## Medical Necessity");
  const conservative = results.find((r) => r.status === "MET" && /conservative|NSAID|medical therapy|weight-loss|treatment tried/i.test(r.text));
  const consNs = conservative ? criteriaCitations[conservative.criterionId] : null;
  lines.push(necessityStatement(coding) + (consNs ? ` Documented prior treatment has not resolved the condition ${consNs.map((n) => `[${n}]`).join("")}.` : ""));
  lines.push("");
  lines.push(...footer(ctx));

  return { letter: lines.join("\n"), citations, criteriaCitations };
}

const SCHEMA = {
  type: "object",
  properties: {
    clinical_summary: { type: "array", items: { type: "string" } },
    treatment_history: { type: "array", items: { type: "string" } },
    examination_and_investigations: { type: "array", items: { type: "string" } },
    medical_necessity: { type: "string" },
  },
  required: ["clinical_summary", "treatment_history", "examination_and_investigations", "medical_necessity"],
  additionalProperties: false,
};

async function llmWrite(ctx) {
  // Claude writes prose, but may only reference pre-verified evidence by id [E#].
  const { documents, results, facts } = ctx;
  const evidence = [];
  const addEv = (quote, docId) => {
    if (!evidence.some((e) => e.quote === quote)) evidence.push({ id: `E${evidence.length + 1}`, quote, docId });
  };
  for (const r of results.filter((x) => x.status === "MET")) r.evidence.forEach((e) => addEv(e.quote, e.docId));
  for (const f of facts) addEv(f.evidence_quote, f.source.doc_id);

  const out = await callJSON({
    system:
      "You write concise, professional Letters of Medical Necessity for prior authorization. " +
      "Every sentence that states a clinical fact must end with one or more evidence markers like [E3] referencing ONLY the provided evidence list. " +
      "Never state a fact that is not in the evidence. Do not invent dates, durations or results. Each array item is one sentence or bullet.",
    prompt:
      `Patient: ${ctx.patient.age}-year-old ${ctx.patient.sex === "F" ? "female" : "male"}. Order: ${ctx.coding.procedure} (CPT ${ctx.coding.cpt}) for ${ctx.order.reason}.\n` +
      `Payer: ${ctx.coding.payer}, policy ${ctx.policy.id}.\n\nEvidence list:\n${evidence.map((e) => `${e.id}: "${e.quote}"`).join("\n")}`,
    schema: SCHEMA,
    effort: "medium",
  });

  // Rebuild with the rule-based skeleton so header, criteria and footer stay deterministic.
  const base = ruleWrite(ctx);
  const { citations } = base;
  const cite = (ev) => {
    const hit = validateQuote(documents, ev.docId, ev.quote);
    if (!hit) return null;
    const existing = citations.find((c) => c.quote === hit.quote);
    if (existing) return existing.n;
    const n = citations.length + 1;
    citations.push({ n, quote: hit.quote, docId: hit.docId, docTitle: hit.docTitle, start: hit.start, end: hit.end });
    return n;
  };
  const convert = (sentence) => {
    let ok = true;
    // accepts [E3] and grouped forms like [E3, E15]
    const text = sentence.replace(/\[(E\d+(?:\s*,\s*E\d+)*)\]/g, (_, group) => {
      const ns = group.split(",").map((id) => {
        const ev = evidence.find((e) => e.id === id.trim());
        return ev ? cite(ev) : null;
      });
      if (ns.some((n) => !n)) ok = false;
      return [...new Set(ns.filter(Boolean))].map((n) => `[${n}]`).join("");
    });
    if (/\[E\d+/.test(text)) ok = false;
    return ok ? text.trim() : null; // sentences referencing unknown evidence are dropped
  };
  const section = (title, items) => {
    const conv = items.map(convert).filter(Boolean);
    return conv.length ? [`## ${title}`, ...conv.map((s) => `- ${s}`), ""] : [];
  };

  const criteriaStart = base.letter.indexOf("## Policy Criteria Met");
  const criteriaEnd = base.letter.indexOf("## Medical Necessity");
  const criteriaBlock = base.letter.slice(criteriaStart, criteriaEnd).trimEnd().split("\n");
  const necessity = convert(out.medical_necessity) || necessityStatement(ctx.coding);

  // LETTER_STYLE=hybrid (default): clinical sections are built from verified chart quotes and the model
  // only writes the Medical Necessity paragraph. A quote check proves a quote exists, not that a sentence
  // uses it correctly, and small models misattribute findings. LETTER_STYLE=full lets the model write
  // every section (the verifier's model audit then reviews it).
  const full = (process.env.LETTER_STYLE || "hybrid").toLowerCase() === "full";
  const baseSection = (title) => {
    const i = base.letter.indexOf(`## ${title}`);
    if (i === -1) return [];
    const rest = base.letter.slice(i);
    const j = rest.indexOf("\n## ", 4);
    return [...rest.slice(0, j === -1 ? undefined : j).trimEnd().split("\n"), ""];
  };
  const lines = [
    ...header(ctx),
    ...(full
      ? [...section("Clinical Summary", out.clinical_summary), ...section("Treatment History", out.treatment_history), ...section("Examination and Investigations", out.examination_and_investigations)]
      : [...baseSection("Clinical Summary"), ...baseSection("Treatment History"), ...baseSection("Examination and Investigations")]),
    ...criteriaBlock,
    "",
    "## Medical Necessity",
    necessity,
    "",
    ...footer(ctx),
  ];
  return { letter: lines.join("\n"), citations, criteriaCitations: base.criteriaCitations };
}

export function buildForm({ patient, coding, order }) {
  return {
    patientName: patient.name,
    dob: patient.dob,
    sex: patient.sex,
    memberId: coding.memberId,
    payer: coding.payer,
    planId: coding.planId,
    providerName: patient.provider.name,
    providerNpi: patient.provider.npi,
    specialty: patient.provider.specialty,
    cpt: coding.cpt,
    procedure: coding.procedure,
    icd10: coding.icd10.map((d) => d.code).join(", "),
    urgency: order.urgency || "routine",
    siteOfService: SITE_OF_SERVICE[order.setting === "inpatient" ? "inpatient" : coding.benefit] || "Outpatient",
    requestedDate: today(),
  };
}

export async function runPacketWriter(ctx) {
  const { result, mode, error } = await withFallback(() => llmWrite(ctx), () => ruleWrite(ctx));
  return { ...result, form: buildForm(ctx), mode, error };
}

/** Writer retry used after a verifier FAIL: drop uncited / invalid lines, re-add missing criteria. */
export function fixPacket(packet, issues, ctx) {
  let lines = packet.letter.split("\n");
  const invalid = new Set(issues.filter((i) => i.type === "CITATION_INVALID").map((i) => i.n));
  const uncitedLines = new Set(issues.filter((i) => i.type === "UNCITED_CLAIM").map((i) => i.line));
  lines = lines.filter((l) => !uncitedLines.has(l) && ![...invalid].some((n) => l.includes(`[${n}]`)));

  const missing = issues.filter((i) => i.type === "CRITERION_NOT_ADDRESSED");
  if (missing.length) {
    const idx = lines.findIndex((l) => l.startsWith("## Medical Necessity"));
    const add = [];
    for (const m of missing) {
      const r = ctx.results.find((x) => x.criterionId === m.criterionId);
      if (!r?.evidence?.length) continue;
      const n = packet.citations.length + 1;
      packet.citations.push({ n, ...r.evidence[0] });
      packet.criteriaCitations[r.criterionId] = [n];
      add.push(`- **${r.criterionId}, ${r.text}:** "${r.evidence[0].quote}" [${n}]`);
    }
    lines.splice(idx > 0 ? idx - 1 : lines.length, 0, ...add);
  }
  return { ...packet, letter: lines.join("\n") };
}

// 8. Verifier Agent — an independent audit of the packet before a human sees it.
// Programmatic checks always run; the LLM adds a contradiction / unsupported-claim review.
import { findQuote } from "../utils/text.js";
import { ICD10 } from "../data/codes.js";
import { callJSON, llmEnabled, provider } from "../llm.js";

const CLINICAL_CLAIM = /\b(\d+\s*(weeks?|months?|mg)|therapy|physical|pain|x-ray|radiograph|positive|tenderness|effusion|reflex|strength|weakness|failed|relief|locking|catching|radiat|NSAID|ibuprofen|naproxen|meloxicam|acetaminophen)\b/i;

export function programmaticChecks({ packet, documents, results, coding, patient }) {
  const issues = [];
  const checks = [];
  const letter = packet.letter;

  // 1. citations resolve to real verbatim quotes
  let bad = 0;
  for (const c of packet.citations) {
    const doc = documents.find((d) => d.id === c.docId);
    if (!doc || !findQuote(doc.text, c.quote)) {
      bad++;
      issues.push({ type: "CITATION_INVALID", severity: "high", fixable: true, n: c.n, message: `Citation [${c.n}] does not match any text in ${c.docTitle || c.docId}.` });
    }
  }
  const markers = [...letter.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
  for (const n of new Set(markers)) {
    if (!packet.citations.some((c) => c.n === n)) {
      bad++;
      issues.push({ type: "CITATION_INVALID", severity: "high", fixable: true, n, message: `Marker [${n}] has no matching source citation.` });
    }
  }
  checks.push({ id: "citations", label: "Every citation resolves to a verbatim chart quote", pass: bad === 0, detail: `${packet.citations.length} citations checked` });

  // 2. required criteria
  const required = results.filter((r) => r.required && r.status !== "NOT_APPLICABLE");
  const unmet = required.filter((r) => r.status !== "MET");
  for (const r of unmet) {
    issues.push({ type: "REQUIRED_CRITERION_UNMET", severity: "high", fixable: false, criterionId: r.criterionId, message: `Required criterion ${r.criterionId} is ${r.status}: ${r.text}` });
  }
  let notAddressed = 0;
  for (const r of required.filter((x) => x.status === "MET")) {
    const ns = packet.criteriaCitations?.[r.criterionId] || [];
    if (!ns.some((n) => letter.includes(`[${n}]`))) {
      notAddressed++;
      issues.push({ type: "CRITERION_NOT_ADDRESSED", severity: "medium", fixable: true, criterionId: r.criterionId, message: `Criterion ${r.criterionId} is met in the chart but not addressed in the letter.` });
    }
  }
  checks.push({ id: "criteria", label: "Every required criterion is met and addressed", pass: unmet.length === 0 && notAddressed === 0, detail: `${required.length - unmet.length}/${required.length} required met` });

  // 3. codes consistent with procedure
  const codeProblems = [];
  if (!coding.icd10.length) codeProblems.push("No ICD-10 code selected.");
  for (const d of coding.icd10) {
    const entry = ICD10.find((x) => x.code === d.code);
    if (!entry) codeProblems.push(`${d.code} is not in the code table.`);
    else if (!entry.cpts.includes(coding.cpt)) codeProblems.push(`${d.code} does not support CPT ${coding.cpt}.`);
  }
  codeProblems.forEach((m) => issues.push({ type: "CODING", severity: "high", fixable: false, message: m }));
  checks.push({ id: "codes", label: "CPT / ICD-10 codes are consistent with the order", pass: codeProblems.length === 0, detail: `${coding.cpt} + ${coding.icd10.map((d) => d.code).join(", ") || "none"}` });

  // 4. identity consistency
  const identityProblems = [];
  if (!letter.includes(patient.name)) identityProblems.push("Patient name missing from letter.");
  if (!letter.includes(coding.memberId)) identityProblems.push("Member ID missing from letter.");
  for (const d of documents) {
    const m = d.text.match(/Patient:\s*([A-Za-z]+ [A-Za-z]+)/);
    if (m && m[1] !== patient.name) identityProblems.push(`Document "${d.title}" names a different patient (${m[1]}).`);
  }
  identityProblems.forEach((m) => issues.push({ type: "IDENTITY_MISMATCH", severity: "high", fixable: false, message: m }));
  checks.push({ id: "identity", label: "Patient identity matches across documents", pass: identityProblems.length === 0, detail: patient.name });

  // 5. uncited clinical claims (body only — header block and sign-off excluded)
  const body = letter.split("\n");
  const start = body.findIndex((l) => l.startsWith("## "));
  const end = body.findIndex((l) => l.startsWith("## Request"));
  let uncited = 0;
  body.slice(start, end === -1 ? undefined : end).forEach((line) => {
    if (line.startsWith("#") || !line.trim()) return;
    if (CLINICAL_CLAIM.test(line) && !/\[\d+\]/.test(line)) {
      uncited++;
      issues.push({ type: "UNCITED_CLAIM", severity: "high", fixable: true, line, message: `Uncited clinical claim: "${line.slice(0, 90)}${line.length > 90 ? "…" : ""}"` });
    }
  });
  checks.push({ id: "uncited", label: "No unsupported clinical statements", pass: uncited === 0, detail: `${uncited} uncited` });

  return { issues, checks };
}

const SCHEMA = {
  type: "object",
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: { message: { type: "string" }, severity: { type: "string", enum: ["high", "medium", "low"] } },
        required: ["message", "severity"],
        additionalProperties: false,
      },
    },
  },
  required: ["issues"],
  additionalProperties: false,
};

async function llmAudit({ packet }) {
  const out = await callJSON({
    system:
      "You are an independent compliance auditor reviewing a prior authorization letter. Flag only real problems: statements that contradict the cited quotes, " +
      "claims not supported by any cited quote, internal inconsistencies (laterality, durations, dates), or misleading wording. Return an empty list if the letter is sound.",
    prompt: `Letter:\n${packet.letter}\n\nCitations:\n${packet.citations.map((c) => `[${c.n}] "${c.quote}"`).join("\n")}`,
    schema: SCHEMA,
    effort: "low",
  });
  return out.issues.map((i) => ({ type: "AUDITOR", severity: i.severity === "high" ? "medium" : i.severity, fixable: false, message: i.message }));
}

export async function runVerifier(ctx) {
  const { issues, checks } = programmaticChecks(ctx);
  let mode = "rules";
  let auditError;
  if (llmEnabled()) {
    try {
      const extra = await llmAudit(ctx);
      issues.push(...extra);
      checks.push({ id: "auditor", label: "Independent model audit: no contradictions", pass: extra.length === 0, detail: `${extra.length} finding(s)` });
      mode = provider();
    } catch (err) {
      auditError = err.message;
    }
  }
  const status = issues.some((i) => i.severity === "high") ? "FAIL" : issues.some((i) => i.severity === "medium") ? "WARN" : "PASS";
  return { status, issues, checks, mode, error: auditError, checkedAt: new Date().toISOString() };
}

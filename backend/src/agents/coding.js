// 2. Coding Agent — maps the order and documented diagnoses to CPT + ICD-10 codes
// from a fixed lookup table (no invented codes), and identifies payer + plan.
import { resolveProcedure, ICD10 } from "../data/codes.js";
import { sentencePool } from "../utils/text.js";

export function runCoding({ order, patient, documents }) {
  const procedure = resolveProcedure(order);

  const pool = sentencePool(documents);
  // Prefer assessment sentences, then the order reason, then the rest of the chart.
  const ranked = [
    ...pool.filter((s) => /^(assessment|impression|diagnosis)/i.test(s.text)),
    { text: order.reason || "", docId: "order" },
    ...pool.filter((s) => !/^(assessment|impression|diagnosis)/i.test(s.text)),
  ];

  // Codes linked to this procedure family; "general" (and custom) procedures may use any entry.
  const allowed = (icd) => procedure.family === "general" || icd.families.includes(procedure.family);

  // Outpatient coding rule (ICD-10-CM guidelines, uncertain diagnosis): do not code conditions documented
  // as "suspected", "rule out", "possible" or "probable"; code the confirmed signs and symptoms instead.
  const UNCERTAIN = /\b(suspected|suspicion of|rule out|r\/o|possible|probable|likely|query)\b[^,.;]*/gi;
  const picked = [];
  for (const s of ranked) {
    const confirmed = s.text.replace(UNCERTAIN, "");
    for (const icd of ICD10) {
      if (!allowed(icd) || picked.some((p) => p.code === icd.code)) continue;
      if (icd.all.every((re) => re.test(confirmed))) {
        picked.push({ code: icd.code, desc: icd.desc, specific: icd.specific, evidence: s.text, docId: s.docId });
      }
    }
    if (picked.length >= 3) break;
  }
  // Specific codes first; drop the generic "pain" code if we have a specific one for the same site.
  picked.sort((a, b) => Number(b.specific) - Number(a.specific));
  const icd10 = picked.slice(0, 3);

  return {
    cpt: procedure.cpt,
    procedure: procedure.name,
    procedureShort: procedure.short,
    family: procedure.family,
    benefit: procedure.benefit,
    kind: procedure.kind,
    custom: Boolean(procedure.custom),
    icd10,
    payer: patient.payer,
    planId: patient.planId,
    memberId: patient.memberId,
    needsConfirmation: icd10.length === 0,
  };
}

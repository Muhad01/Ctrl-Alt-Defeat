// Evaluation harness: 6 hand-labeled cases (expected verdicts written from the chart text,
// not from the system's output). Reports criteria match accuracy, evidence grounding rate,
// gap detection recall and the insurer (RAG) effect.
//   npm run eval            uses the configured AI mode
//   npm run eval -- --rules forces the rule engine
import "dotenv/config";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { PATIENTS, DOCUMENTS } from "./data/patients.js";
import { POLICIES } from "./data/policies.js";
import { runMatcher } from "./agents/matcher.js";
import { readinessScore } from "./agents/readiness.js";
import { validateQuote } from "./utils/text.js";
import { aiModeInfo, setForceHeuristic } from "./llm.js";

export const EVAL_CASES = [
  { id: 1, label: "8 weeks PT, X-ray done", patientId: "P001", policyId: "BRH-KNEE-MRI", expected: { K1: "MET", K2: "MET", K3: "MET", K4: "MET", K5: "MET" } },
  { id: 2, label: "4 weeks PT vs insurer needing 6 (demo case)", patientId: "P009", policyId: "BRH-KNEE-MRI", expected: { K1: "MET", K2: "MISSING", K3: "MET", K4: "MET", K5: "MET" } },
  { id: 3, label: "Same patient, insurer needing 4 weeks (RAG effect)", patientId: "P009", policyId: "IHL-KNEE-MRI", expected: { K1: "MET", K2: "MET", K3: "MET", K4: "MET", K5: "MET" } },
  { id: 4, label: "Vague PT history, no lumbar X-ray", patientId: "P005", policyId: "BRH-LSPINE-MRI", expected: { L1: "MET", L2: "UNCLEAR", L3: "MET", L4: "MET", L5: "MISSING" } },
  { id: 5, label: "No knee X-ray, 6 of 8 PT weeks", patientId: "P006", policyId: "NSI-KNEE-MRI", expected: { K1: "MET", K2: "MISSING", K3: "MET", K4: "MISSING", K5: "MET" } },
  { id: 6, label: "Red-flag exception (progressive foot drop)", patientId: "P004", policyId: "MCR-LSPINE-MRI", expected: { L1: "MET", L2: "MET", L3: "MET", L4: "MISSING", L5: "MISSING" } },
];

export async function runEvaluation({ forceRules = false } = {}) {
  if (forceRules) setForceHeuristic(true);
  const ai = aiModeInfo();
  const cases = [];
  let correct = 0;
  let total = 0;
  let citedQuotes = 0;
  let verifiedQuotes = 0;
  let plantedGaps = 0;
  let caughtGaps = 0;
  let falseGaps = 0;
  const model = { returned: 0, exact: 0, repaired: 0, rejected: 0 };
  const started = Date.now();
  try {
    for (const ec of EVAL_CASES) {
      const policy = POLICIES.find((p) => p.id === ec.policyId);
      const documents = DOCUMENTS.filter((d) => d.patientId === ec.patientId && d.available);
      const { results, mode, error, grounding } = await runMatcher(policy, documents);
      if (grounding) for (const k of Object.keys(model)) model[k] += grounding[k];
      const rows = results.map((r) => {
        const expected = ec.expected[r.criterionId];
        const ok = expected === r.status;
        total++;
        if (ok) correct++;
        for (const e of r.evidence) {
          citedQuotes++;
          if (validateQuote(documents, e.docId, e.quote)) verifiedQuotes++;
        }
        if (r.required && expected !== "MET") {
          plantedGaps++;
          if (r.status !== "MET") caughtGaps++;
        }
        if (r.required && expected === "MET" && r.status !== "MET") falseGaps++;
        return { criterionId: r.criterionId, required: r.required, expected, actual: r.status, ok };
      });
      cases.push({ ...ec, patient: PATIENTS.find((p) => p.id === ec.patientId).name, payer: policy.payer, mode, error: error || null, readiness: readinessScore(results, policy).score, rows, correct: rows.filter((x) => x.ok).length });
    }
  } finally {
    if (forceRules) setForceHeuristic(false);
  }
  const c2 = cases.find((c) => c.id === 2);
  const c3 = cases.find((c) => c.id === 3);
  const report = {
    ranAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    engine: forceRules ? "rules" : ai.mode === "llm" ? `${ai.providerLabel} ${ai.model} (matcher authority: ${process.env.MATCHER_AUTHORITY || "rules"})` : "rules",
    metrics: {
      criteriaAccuracy: total ? correct / total : 0,
      criteriaCorrect: correct,
      criteriaTotal: total,
      groundingRate: citedQuotes ? verifiedQuotes / citedQuotes : 1,
      citedQuotes,
      verifiedQuotes,
      gapRecall: plantedGaps ? caughtGaps / plantedGaps : 1,
      plantedGaps,
      caughtGaps,
      falseGaps,
      insurerEffect: Boolean(c2 && c3 && c2.rows.find((r) => r.criterionId === "K2").actual !== "MET" && c3.rows.find((r) => r.criterionId === "K2").actual === "MET"),
      modelQuotes: model.returned ? { ...model, exactRate: model.exact / model.returned } : null,
    },
    cases,
  };
  return report;
}

export function printReport(r) {
  const pct = (x) => `${(x * 100).toFixed(1)}%`;
  console.log(`\nEvaluation: ${r.engine}  (${(r.durationMs / 1000).toFixed(1)}s)`);
  for (const c of r.cases) {
    console.log(`  Case ${c.id} ${c.patient} / ${c.payer}: ${c.correct}/${c.rows.length} correct, readiness ${c.readiness}  ${c.label}`);
    for (const row of c.rows.filter((x) => !x.ok)) console.log(`      ${row.criterionId}: expected ${row.expected}, got ${row.actual}`);
  }
  const m = r.metrics;
  console.log(`\n  Criteria match accuracy : ${pct(m.criteriaAccuracy)} (${m.criteriaCorrect}/${m.criteriaTotal})`);
  console.log(`  Evidence grounding rate : ${pct(m.groundingRate)} (${m.verifiedQuotes}/${m.citedQuotes} cited quotes verbatim in chart)`);
  console.log(`  Gap detection recall    : ${pct(m.gapRecall)} (${m.caughtGaps}/${m.plantedGaps} planted gaps caught, ${m.falseGaps} false gaps)`);
  console.log(`  Insurer (RAG) effect    : ${m.insurerEffect ? "yes. Same chart fails one insurer, passes the other" : "NO"}`);
  if (m.modelQuotes) console.log(`  Raw model quotes        : ${m.modelQuotes.exact} exact, ${m.modelQuotes.repaired} repaired, ${m.modelQuotes.rejected} rejected of ${m.modelQuotes.returned}`);
}

export function saveReport(r) {
  const file = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..", "data", "eval-results.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(r, null, 1));
  return file;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await runEvaluation({ forceRules: process.argv.includes("--rules") });
  printReport(r);
  console.log(`\nSaved to ${saveReport(r)}`);
}

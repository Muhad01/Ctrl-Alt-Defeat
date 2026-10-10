// 9. Denial Predictor — logistic regression trained on synthetic historical cases.
// Explainability: for a linear model, contribution_i = w_i * (x_i - mean_i) is the exact
// SHAP value (independent features), so the bar chart in the UI is honest.
import { mulberry32 } from "../utils/text.js";
import { MOCK_PAYERS as PAYERS } from "../data/policies.js";

export const FEATURES = [
  { key: "all_met", label: "All required criteria met", fix: "Every required criterion must be documented. Close the open gaps." },
  { key: "met_ratio", label: "Share of required criteria met", fix: "Close the remaining documentation gaps." },
  { key: "missing_required", label: "Missing required criteria", fix: "Attach records for every missing required criterion." },
  { key: "unclear", label: "Unclear criteria", fix: "Clarify durations and outcomes in the note." },
  { key: "verifier_pass", label: "Verifier passed", fix: "Resolve verifier issues before submitting." },
  { key: "dx_specific", label: "Specific diagnosis code", fix: "Use a more specific ICD-10 code supported by the exam." },
  { key: "payer_northstar", label: "Payer: Northstar (strict)", fix: "Northstar denies more often. Make sure every criterion is explicitly cited." },
  { key: "payer_blueriver", label: "Payer: BlueRiver", fix: "Include medication trial details for BlueRiver." },
  { key: "lumbar", label: "Procedure: lumbar MRI", fix: "Document red flags or conservative therapy duration clearly." },
  { key: "evidence_docs", label: "Supporting documents cited", fix: "Cite more than one source document (e.g., PT notes, imaging report)." },
];

// "True" generating process for the synthetic history (unknown to the model).
const TRUE_W = { bias: -3.2, all_met: 2.6, met_ratio: 3.0, missing_required: -0.9, unclear: -0.6, verifier_pass: 0.7, dx_specific: 0.5, payer_northstar: -0.7, payer_blueriver: -0.2, lumbar: -0.3, evidence_docs: 0.9 };

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

export function featuresFromCase({ results, verifier, coding, packet }) {
  const required = results.filter((r) => r.required && r.status !== "NOT_APPLICABLE");
  const met = required.filter((r) => r.status === "MET").length;
  const docsCited = new Set((packet?.citations || []).map((c) => c.docId)).size;
  return {
    all_met: met === required.length ? 1 : 0,
    met_ratio: required.length ? met / required.length : 1,
    missing_required: required.filter((r) => r.status === "MISSING").length,
    unclear: results.filter((r) => r.status === "UNCLEAR").length,
    verifier_pass: verifier && verifier.status !== "FAIL" ? 1 : 0,
    dx_specific: coding.icd10.some((d) => d.specific) ? 1 : 0,
    payer_northstar: coding.payer === "Northstar Insurance" ? 1 : 0,
    payer_blueriver: coding.payer === "BlueRiver Health" ? 1 : 0,
    lumbar: coding.cpt === "72148" ? 1 : 0,
    evidence_docs: Math.min(1, docsCited / 2),
  };
}

/** Synthetic historical cases with realistic denial behaviour (stated honestly in the UI). */
export function generateHistory(n = 600, seed = 42) {
  const rand = mulberry32(seed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const reasons = ["INSUFFICIENT_CONSERVATIVE_THERAPY", "NO_PRIOR_IMAGING", "MISSING_CLINICAL_DOCUMENTATION", "NOT_MEDICALLY_NECESSARY", "CODING_ERROR"];
  const history = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const payer = pick(PAYERS);
    const cpt = rand() < 0.55 ? "73721" : "72148";
    const requiredCount = 3 + Math.floor(rand() * 3);
    const met = rand() < 0.62 ? requiredCount : Math.floor(rand() * requiredCount);
    const missing = Math.max(0, requiredCount - met - (rand() < 0.3 ? 1 : 0));
    const f = {
      all_met: met === requiredCount ? 1 : 0,
      met_ratio: met / requiredCount,
      missing_required: missing,
      unclear: requiredCount - met - missing,
      verifier_pass: rand() < 0.6 + 0.3 * (met / requiredCount) ? 1 : 0,
      dx_specific: rand() < 0.65 ? 1 : 0,
      payer_northstar: payer === "Northstar Insurance" ? 1 : 0,
      payer_blueriver: payer === "BlueRiver Health" ? 1 : 0,
      lumbar: cpt === "72148" ? 1 : 0,
      evidence_docs: rand() < 0.5 ? 1 : 0.5,
    };
    const z = TRUE_W.bias + FEATURES.reduce((s, ft) => s + TRUE_W[ft.key] * f[ft.key], 0) + (rand() - 0.5) * 1.2;
    let approved = rand() < sigmoid(z);
    // Payer behaviour: Northstar occasionally denies fully documented requests (accountability engine demo).
    let inappropriate = false;
    if (approved && payer === "Northstar Insurance" && f.met_ratio === 1 && rand() < 0.16) {
      approved = false;
      inappropriate = true;
    }
    const allMet = f.met_ratio === 1;
    const denialReason = approved ? null : inappropriate ? "NOT_MEDICALLY_NECESSARY" : allMet ? pick(["NOT_MEDICALLY_NECESSARY", "CODING_ERROR"]) : pick(reasons.slice(0, 3));
    const appealed = !approved && rand() < 0.5;
    const overturned = appealed && (allMet ? rand() < 0.8 : rand() < 0.3);
    history.push({
      id: `H-${1000 + i}`,
      source: "synthetic",
      date: new Date(now - Math.floor(rand() * 120) * 86400000).toISOString().slice(0, 10),
      payer,
      cpt,
      features: f,
      decision: approved ? "APPROVED" : "DENIED",
      denialReason,
      allRequiredMet: allMet,
      appealed,
      appealOutcome: appealed ? (overturned ? "OVERTURNED" : "UPHELD") : null,
      manualMinutes: Math.round(30 + rand() * 25),
      copilot: false,
    });
  }
  return history;
}

function auc(scores, labels) {
  const pairs = scores.map((s, i) => [s, labels[i]]).sort((a, b) => a[0] - b[0]);
  let rankSum = 0;
  let pos = 0;
  pairs.forEach(([, y], i) => {
    if (y) {
      rankSum += i + 1;
      pos++;
    }
  });
  const neg = pairs.length - pos;
  return pos && neg ? (rankSum - (pos * (pos + 1)) / 2) / (pos * neg) : 0.5;
}

export function trainModel(history) {
  const rows = history.map((h) => ({ x: FEATURES.map((f) => h.features[f.key]), y: h.decision === "APPROVED" ? 1 : 0 }));
  const split = Math.floor(rows.length * 0.8);
  const train = rows.slice(0, split);
  const test = rows.slice(split);
  const k = FEATURES.length;
  let w = new Array(k).fill(0);
  let b = 0;
  const lr = 0.3;
  const l2 = 0.001;
  for (let epoch = 0; epoch < 2500; epoch++) {
    const gw = new Array(k).fill(0);
    let gb = 0;
    for (const { x, y } of train) {
      const p = sigmoid(b + x.reduce((s, xi, i) => s + xi * w[i], 0));
      const e = p - y;
      for (let i = 0; i < k; i++) gw[i] += e * x[i];
      gb += e;
    }
    w = w.map((wi, i) => wi - lr * (gw[i] / train.length + l2 * wi));
    b -= lr * (gb / train.length);
  }
  const means = FEATURES.map((_, i) => train.reduce((s, r) => s + r.x[i], 0) / train.length);
  const predict = (x) => sigmoid(b + x.reduce((s, xi, i) => s + xi * w[i], 0));
  const testScores = test.map((r) => predict(r.x));
  const bins = Array.from({ length: 5 }, (_, i) => ({ bin: `${i * 20}-${i * 20 + 20}%`, predicted: 0, actual: 0, n: 0 }));
  test.forEach((r, i) => {
    const bi = Math.min(4, Math.floor(testScores[i] * 5));
    bins[bi].predicted += testScores[i];
    bins[bi].actual += r.y;
    bins[bi].n++;
  });
  return {
    weights: Object.fromEntries(FEATURES.map((f, i) => [f.key, Number(w[i].toFixed(4))])),
    bias: Number(b.toFixed(4)),
    means: Object.fromEntries(FEATURES.map((f, i) => [f.key, means[i]])),
    auc: Number(auc(testScores, test.map((r) => r.y)).toFixed(3)),
    accuracy: Number((test.filter((r, i) => (testScores[i] >= 0.5 ? 1 : 0) === r.y).length / test.length).toFixed(3)),
    calibration: bins.map((x) => ({ bin: x.bin, predicted: x.n ? Number((x.predicted / x.n).toFixed(3)) : null, actual: x.n ? Number((x.actual / x.n).toFixed(3)) : null, n: x.n })),
    trainedOn: train.length,
    testedOn: test.length,
    trainedAt: new Date().toISOString(),
  };
}

export function predict(model, features) {
  const z = model.bias + FEATURES.reduce((s, f) => s + model.weights[f.key] * features[f.key], 0);
  const probability = sigmoid(z);
  const contributions = FEATURES.map((f) => ({
    key: f.key,
    label: f.label,
    value: features[f.key],
    contribution: Number((model.weights[f.key] * (features[f.key] - model.means[f.key])).toFixed(3)),
    fix: f.fix,
  })).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const risks = contributions.filter((c) => c.contribution < -0.05).slice(0, 3);
  return {
    probability: Number(probability.toFixed(3)),
    riskLevel: probability >= 0.75 ? "LOW" : probability >= 0.5 ? "MEDIUM" : "HIGH",
    contributions,
    topRisks: risks.map((r) => ({ label: r.label, impact: r.contribution, fix: r.fix })),
    features,
  };
}

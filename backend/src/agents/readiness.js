// Readiness Score: a transparent, rule-based checklist score (not an approval probability).
//
//   score = 100 × (Σ weight of MET criteria) / (Σ weight of all criteria)
//   weight: required = 2, optional = 1;  UNCLEAR counts as half its weight
//   NOT_APPLICABLE criteria are excluded;  capped at 60 if any required criterion is MISSING
//
// With real approval/denial history this could be replaced by a trained model.

export function readinessScore(results, policy, { coverage = null, decisions = {} } = {}) {
  let earned = 0;
  let total = 0;
  const fixes = [];
  for (const r of results) {
    if (r.status === "NOT_APPLICABLE") continue;
    const weight = r.required ? 2 : 1;
    total += weight;
    if (r.status === "MET") earned += weight;
    else if (r.status === "UNCLEAR") earned += weight / 2;
    if (r.status !== "MET") {
      const c = policy?.criteria.find((x) => x.id === r.criterionId);
      fixes.push({ criterionId: r.criterionId, required: r.required, status: r.status, points: r.status === "UNCLEAR" ? weight / 2 : weight, fix: c?.fixHint || `Document: ${r.text}` });
    }
  }
  const raw = total ? (100 * earned) / total : 100;
  const missingRequired = results.some((r) => r.required && r.status === "MISSING");
  const requiredUnmet = results.some((r) => r.required && !["MET", "NOT_APPLICABLE"].includes(r.status));
  // A benefit the plan does not cover cannot be fixed with documents: cap at 40 unless overridden
  // (e.g. the coordinator recorded written authorization from the insurer).
  const notCovered = coverage?.status === "NOT_COVERED" && decisions.COVERAGE !== "na";
  let score = Math.round(missingRequired ? Math.min(60, raw) : raw);
  if (notCovered) {
    score = Math.min(40, score);
    fixes.unshift({ criterionId: "COVERAGE", required: true, status: "NOT_COVERED", points: 0, fix: `${coverage.blocker.rule}: not a covered benefit under ${coverage.plan}. ${coverage.override ? `Option: ${coverage.override}` : "Discuss self-pay or another plan with the patient."}` });
  }
  if (coverage?.status === "CONDITIONAL") {
    const cond = coverage.findings.filter((f) => f.result === "CONDITION").map((f) => f.detail).join(" ");
    fixes.unshift({ criterionId: "COVERAGE", required: false, status: "CONDITIONAL", points: 0, fix: `Covered only under conditions (${coverage.plan}): ${cond}` });
  }
  fixes.sort((a, b) => (b.criterionId === "COVERAGE") - (a.criterionId === "COVERAGE") || Number(b.required) - Number(a.required) || b.points - a.points);
  return {
    score,
    rawScore: Math.round(raw),
    // The label never says READY while a required criterion is unmet, even if the number is high.
    level: notCovered ? "NOT_READY" : score >= 85 && !requiredUnmet ? "READY" : score >= 60 ? "NEEDS_WORK" : "NOT_READY",
    capped: (missingRequired && raw > 60) || (notCovered && raw > 40),
    capReason: notCovered ? "Capped at 40: not a covered benefit under the plan" : missingRequired && raw > 60 ? "Capped at 60: a required criterion is missing" : null,
    earned,
    total,
    fixes,
    formula: "100 × Σ weight(MET) / Σ weight(all); required = 2, supporting = 1; UNCLEAR = half; cap 60 if a required criterion is MISSING",
  };
}

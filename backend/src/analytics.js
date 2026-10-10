// Dashboard / analytics aggregation over live cases and the outcome history.
import { db } from "./db.js";
import { DENIAL_CLASSES } from "./data/codes.js";
import { MOCK_PAYERS as PAYERS } from "./data/policies.js"; // synthetic stats only ever describe mock payers

const MANUAL_BASELINE_MIN = 45; // industry estimate for a manual PA request (labelled as an estimate in the UI)
const REVIEW_ESTIMATE_MIN = 5; // estimated coordinator review time with the copilot

export function summary() {
  const { cases, history, model } = db();
  const open = cases.filter((c) => !["APPROVED", "DENIED", "REJECTED", "OVERTURNED", "UPHELD"].includes(c.status));
  const decided = history.filter((h) => h.decision);
  const approvalRate = decided.length ? decided.filter((h) => h.decision === "APPROVED").length / decided.length : 0;
  const rate = (arr) => (arr.length ? arr.filter((h) => h.decision === "APPROVED").length / arr.length : 0);

  const processingSeconds = cases
    .filter((c) => c.metrics?.readyAt && c.createdBy !== "Demo seed")
    .map((c) => (new Date(c.metrics.readyAt) - new Date(c.metrics.startedAt)) / 1000)
    .filter((s) => s > 0 && s < 3600);
  const avgAgentSeconds = processingSeconds.length ? processingSeconds.reduce((a, b) => a + b, 0) / processingSeconds.length : null;
  const completed = cases.filter((c) => c.approval).length;

  const needsAttention = [
    ...cases.filter((c) => c.status === "NEEDS_INFO").map((c) => ({ caseId: c.id, patient: c.patientName, kind: "Gap waiting on clinician", detail: c.gaps.filter((g) => g.status === "OPEN").map((g) => g.criterionText).join("; ") })),
    ...cases.filter((c) => c.status === "READY_FOR_REVIEW").map((c) => ({ caseId: c.id, patient: c.patientName, kind: "Packet awaiting review", detail: `Readiness ${c.readiness?.score ?? "–"}/100` })),
    ...cases.filter((c) => ["DENIED", "APPEAL_DRAFTED"].includes(c.status)).map((c) => ({ caseId: c.id, patient: c.patientName, kind: "Denial needs appeal", detail: c.denial?.reasonText?.slice(0, 90) })),
  ];

  // last 14 days of activity (history dates + live cases)
  const days = Array.from({ length: 14 }, (_, i) => new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10));
  const perDay = days.map((d) => ({ date: d.slice(5), cases: history.filter((h) => h.date === d).length + cases.filter((c) => c.createdAt.slice(0, 10) === d && !history.some((h) => h.caseId === c.id)).length }));

  const statusCounts = {};
  cases.forEach((c) => (statusCounts[c.status] = (statusCounts[c.status] || 0) + 1));

  return {
    kpis: {
      openCases: open.length,
      totalCases: cases.length,
      approvalRate,
      liveApprovalRate: rate(decided.filter((h) => h.source === "live")),
      liveDecided: decided.filter((h) => h.source === "live").length,
      avgPredictedApproval: open.filter((c) => c.prediction).reduce((s, c, _, a) => s + c.prediction.probability / a.length, 0),
      avgReadiness: (() => {
        const scored = open.filter((c) => c.readiness);
        return scored.length ? Math.round(scored.reduce((s, c) => s + c.readiness.score, 0) / scored.length) : null;
      })(),
      casesWithGaps: cases.filter((c) => c.gaps?.some((g) => g.status === "OPEN")).length,
      avgAgentSeconds,
      manualBaselineMinutes: MANUAL_BASELINE_MIN,
      copilotMinutes: REVIEW_ESTIMATE_MIN,
      hoursSaved: (completed * (MANUAL_BASELINE_MIN - REVIEW_ESTIMATE_MIN)) / 60,
      preventableDenialsCaught: cases.filter((c) => c.predictionHistory?.some((p) => p.label === "Before gap closure")).length,
    },
    needsAttention,
    perDay,
    statusCounts: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    model: { auc: model.auc, accuracy: model.accuracy, trainedOn: model.trainedOn, trainedAt: model.trainedAt },
  };
}

export function analytics() {
  const { history, model, cases } = db();
  const denied = history.filter((h) => h.decision === "DENIED");
  const reasons = Object.keys(DENIAL_CLASSES)
    .map((k) => ({ reason: DENIAL_CLASSES[k], key: k, count: denied.filter((h) => h.denialReason === k).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  // approval rate by week (last 12 weeks), copilot vs manual
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const end = Date.now() - (11 - i) * 7 * 86400000;
    const start = end - 7 * 86400000;
    const inWeek = history.filter((h) => {
      const t = new Date(h.date).getTime();
      return t > start && t <= end;
    });
    const r = (arr) => (arr.length ? Number((arr.filter((h) => h.decision === "APPROVED").length / arr.length).toFixed(3)) : null);
    return { week: new Date(end).toISOString().slice(5, 10), approvalRate: r(inWeek), volume: inWeek.length };
  });

  // Payer accountability: denials where every required criterion was documented as met
  const payers = PAYERS.map((payer) => {
    const all = history.filter((h) => h.payer === payer);
    const den = all.filter((h) => h.decision === "DENIED");
    const inappropriate = den.filter((h) => h.allRequiredMet && ["NOT_MEDICALLY_NECESSARY"].includes(h.denialReason));
    const appealed = den.filter((h) => h.appealed);
    const overturned = appealed.filter((h) => h.appealOutcome === "OVERTURNED");
    return {
      payer,
      requests: all.length,
      denialRate: all.length ? den.length / all.length : 0,
      inappropriateDenials: inappropriate.length,
      inappropriateRate: den.length ? inappropriate.length / den.length : 0,
      appealOverturnRate: appealed.length ? overturned.length / appealed.length : 0,
    };
  });

  const live = history.filter((h) => h.source === "live");
  return {
    reasons,
    weeks,
    payers,
    calibration: model.calibration,
    model: { auc: model.auc, accuracy: model.accuracy, trainedOn: model.trainedOn, testedOn: model.testedOn, trainedAt: model.trainedAt, weights: model.weights },
    turnaround: { manualMinutes: MANUAL_BASELINE_MIN, copilotMinutes: REVIEW_ESTIMATE_MIN, note: "Manual baseline is an industry estimate. Copilot minutes = estimated human review time after agents finish." },
    liveOutcomes: live.length,
    appeals: {
      drafted: cases.filter((c) => c.appeal).length,
      submitted: cases.filter((c) => c.appeal?.submittedAt).length,
      overturned: cases.filter((c) => c.appeal?.outcome === "OVERTURNED").length,
    },
  };
}

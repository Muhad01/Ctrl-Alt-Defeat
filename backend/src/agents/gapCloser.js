// 5. Gap-Closer Agent — turns each MISSING / UNCLEAR required criterion into one
// specific question for the right person, with quick actions.
import { newId } from "../db.js";

export function runGapCloser({ policy, results, decisions = {}, existingGaps = [], pendingDocs = [] }) {
  const gaps = [];
  for (const r of results) {
    if (!r.required || !["MISSING", "UNCLEAR"].includes(r.status) || decisions[r.criterionId]) continue;
    const criterion = policy.criteria.find((c) => c.id === r.criterionId);
    const open = existingGaps.find((g) => g.criterionId === r.criterionId && g.status === "OPEN");
    if (open) {
      gaps.push(open);
      continue;
    }
    gaps.push({
      id: newId("G"),
      criterionId: r.criterionId,
      criterionText: r.text,
      status: "OPEN",
      finding: r.status,
      question: criterion.gapQuestion,
      detail: r.reasoning,
      assignedRole: criterion.assignedRole,
      wouldBeDenied: true,
      denialClass: criterion.denialClass,
      suggestedDocs: pendingDocs.map((d) => ({ id: d.id, title: d.title, date: d.date })),
      actions: ["attach_document", "add_note", "mark_not_applicable", "confirm_not_done"],
      createdAt: new Date().toISOString(),
    });
  }
  return gaps;
}

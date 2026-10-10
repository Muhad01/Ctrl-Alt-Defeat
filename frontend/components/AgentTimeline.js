"use client";
import { CheckCircle2, Loader2, AlertTriangle, PauseCircle, Info, XCircle } from "lucide-react";
import { fmtTime } from "@/lib/format";
import { ModeTag } from "./ui";

const STEP_LABEL = {
  system: "Copilot",
  reader: "Report Reader",
  intake: "Intake Agent",
  coding: "Coding Agent",
  coverage: "Coverage Check",
  policy: "Policy Agent (RAG)",
  matcher: "Criteria Matcher",
  gap_closer: "Gap-Closer",
  packet_writer: "Packet Writer",
  insurer_simulator: "Insurer Simulator",
  verifier: "Verifier",
  denial_predictor: "Denial Predictor",
  human_review: "Human Review",
  submission: "Submission",
  payer_decision: "Payer Decision",
  appeal: "Appeal Agent",
  learning: "Learning Loop",
};

const ICON = {
  running: <Loader2 size={16} className="animate-spin text-sky-600" />,
  done: <CheckCircle2 size={16} className="text-emerald-600" />,
  waiting: <PauseCircle size={16} className="text-amber-600" />,
  warning: <AlertTriangle size={16} className="text-orange-600" />,
  error: <XCircle size={16} className="text-red-600" />,
  info: <Info size={16} className="text-slate-400" />,
};

export default function AgentTimeline({ timeline = [], compact = false }) {
  // Collapse "running" entries that already have a later result for the same step.
  const items = timeline.filter((e, i) => !(e.status === "running" && timeline.slice(i + 1).some((x) => x.step === e.step && x.status !== "running")));
  const shown = compact ? items.slice(-12) : items;
  return (
    <ol className="relative space-y-3">
      {shown.map((e) => (
        <li key={e.id} className="flex animate-fadein gap-3">
          <div className="mt-0.5">{ICON[e.status] || ICON.info}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-800">{STEP_LABEL[e.step] || e.step}</span>
              <ModeTag mode={e.mode} />
              <span className="text-slate-400">{fmtTime(e.ts)}</span>
            </div>
            <p className="text-sm text-slate-600">{e.message}</p>
            {e.error && <p className="text-xs text-orange-600">LLM unavailable, used rule engine: {e.error}</p>}
          </div>
        </li>
      ))}
      {!shown.length && <li className="text-sm text-slate-400">Waiting for agents…</li>}
    </ol>
  );
}

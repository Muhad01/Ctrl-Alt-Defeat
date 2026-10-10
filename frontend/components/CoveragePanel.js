"use client";
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle, ExternalLink, Landmark } from "lucide-react";

const RESULT = {
  PASS: { icon: CheckCircle2, cls: "text-emerald-600" },
  FAIL: { icon: XCircle, cls: "text-red-600" },
  CONDITION: { icon: AlertTriangle, cls: "text-amber-600" },
  VERIFY: { icon: HelpCircle, cls: "text-sky-600" },
  INFO: { icon: Info, cls: "text-slate-400" },
};

export const COVERAGE_STATUS = {
  COVERED: { label: "Covered benefit", cls: "bg-emerald-100 text-emerald-800" },
  CONDITIONAL: { label: "Covered with conditions", cls: "bg-amber-100 text-amber-800" },
  NOT_COVERED: { label: "Not a covered benefit", cls: "bg-red-100 text-red-800" },
};

/** Result of the Coverage Check agent against a real insurer's published plan terms. */
export default function CoveragePanel({ coverage, compact = false }) {
  if (!coverage) return null;
  const s = COVERAGE_STATUS[coverage.status];
  const findings = compact ? coverage.findings.filter((f) => f.result !== "INFO") : coverage.findings;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Landmark size={16} className="text-slate-500" />
        <span className={`chip ${s.cls}`}>{s.label}</span>
        <span className="text-xs text-slate-500">{coverage.plan}</span>
      </div>
      <p className="mb-3 text-sm text-slate-700">{coverage.summary}</p>
      <ul className="space-y-2">
        {findings.map((f, i) => {
          const R = RESULT[f.result] || RESULT.INFO;
          return (
            <li key={i} className="flex gap-2 text-xs">
              <R.icon size={14} className={`mt-0.5 shrink-0 ${R.cls}`} />
              <span>
                <span className="font-medium text-slate-800">{f.rule}:</span> <span className="text-slate-600">{f.detail}</span>
                {f.quote && <span className="mt-0.5 block italic text-slate-500">Insurer wording: &ldquo;{f.quote}&rdquo;</span>}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 space-y-0.5 border-t border-slate-100 pt-2">
        {coverage.sources.map((src) => (
          <a key={src.url} href={src.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-brand-700 hover:underline">
            <ExternalLink size={11} /> {src.title} (retrieved {src.retrieved})
          </a>
        ))}
        <p className="text-[11px] text-slate-400">Public plan information; verify the member's actual policy schedule with the insurer.</p>
      </div>
    </div>
  );
}

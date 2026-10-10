"use client";
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle } from "lucide-react";

const META = {
  MET: { icon: CheckCircle2, cls: "text-emerald-600", label: "Met", ring: "border-emerald-200" },
  MISSING: { icon: XCircle, cls: "text-red-600", label: "Missing", ring: "border-red-200" },
  UNCLEAR: { icon: AlertTriangle, cls: "text-amber-600", label: "Unclear", ring: "border-amber-200" },
  NOT_APPLICABLE: { icon: MinusCircle, cls: "text-slate-400", label: "N/A", ring: "border-slate-200" },
};

export default function CriteriaChecklist({ criteria = [], policy, activeQuote, onSelectEvidence }) {
  if (!criteria.length) return <p className="text-sm text-slate-400">Criteria will appear once the policy is retrieved and matched.</p>;
  return (
    <div className="space-y-3">
      {policy && (
        <div className="text-xs text-slate-500">
          <span className="mr-1.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">{policy.real ? "REAL PLAN TERMS + DEMO CRITERIA" : "MOCK POLICY"}</span>
          {policy.name} · <span className="font-mono">{policy.id} {policy.version}</span>
        </div>
      )}
      {criteria.map((r) => {
        const m = META[r.status] || META.UNCLEAR;
        const Icon = m.icon;
        return (
          <div key={r.criterionId} className={`rounded-lg border bg-white p-3 ${m.ring}`}>
            <div className="flex items-start gap-2.5">
              <Icon size={18} className={`mt-0.5 shrink-0 ${m.cls}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs text-slate-500">
                    {r.criterionId} · §{r.ref}
                  </span>
                  <span className={`chip px-1.5 py-0 text-[10px] ${r.required ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>{r.required ? "required" : "supporting"}</span>
                  <span className={`text-xs font-semibold ${m.cls}`}>{m.label}</span>
                  {r.confidence != null && <span className="text-xs text-slate-400">{Math.round(r.confidence * 100)}% conf.</span>}
                  {r.disputed && <span className="chip bg-orange-100 px-1.5 py-0 text-[10px] text-orange-700" title="Keyword rules and the AI reviewer disagree; a human must confirm">AI disputed</span>}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-800">{r.text}</div>
                <div className="mt-1 text-xs text-slate-500">{r.reasoning}</div>
                {r.evidence?.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {r.evidence.map((e, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onSelectEvidence?.(e)}
                        className={`block w-full rounded-md border px-2.5 py-1.5 text-left text-xs transition ${activeQuote === e.quote ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50"}`}
                      >
                        <span className="italic text-slate-700">&ldquo;{e.quote}&rdquo;</span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">{e.docTitle}. Click to highlight in chart</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

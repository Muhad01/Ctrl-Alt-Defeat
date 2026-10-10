"use client";
import { CheckCircle2, XCircle, AlertTriangle, Building2, Bot, ShieldCheck, ShieldAlert, Quote } from "lucide-react";
import { pct } from "@/lib/format";

/** Rule-based Readiness Score (0-100), the primary score shown to staff. */
export function ReadinessGauge({ readiness, history = [] }) {
  const score = readiness?.score ?? 0;
  const p = score / 100;
  const angle = Math.PI * (1 - p);
  const x = 60 + 48 * Math.cos(angle);
  const y = 60 - 48 * Math.sin(angle);
  const color = readiness?.level === "READY" ? "#059669" : readiness?.level === "NEEDS_WORK" ? "#d97706" : "#dc2626";
  const steps = history.filter((h) => h.readiness != null);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-44" role="img" aria-label={`Readiness score ${score} of 100`}>
        <path d="M12 60 A48 48 0 0 1 108 60" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
        {score > 0 && <path d={`M12 60 A48 48 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />}
        <text x="60" y="54" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 20, fontWeight: 600 }}>
          {readiness ? score : "–"}
        </text>
        <text x="60" y="66" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 7 }}>
          / 100
        </text>
      </svg>
      <div className="text-xs font-medium text-slate-600">Readiness Score</div>
      {readiness?.capped && <div className="mt-0.5 text-[11px] text-red-600">{readiness.capReason || "Capped at 60: a required criterion is missing"}</div>}
      {steps.length > 1 && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1 text-xs text-slate-600">
          {steps.map((h, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300">→</span>}
              <span title={h.label} className="rounded bg-slate-100 px-1.5 py-0.5">
                {h.readiness}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReadinessFixes({ readiness }) {
  if (!readiness) return null;
  if (!readiness.fixes.length) return <p className="text-xs text-emerald-700">Every criterion is documented. Nothing to fix.</p>;
  return (
    <ul className="space-y-2">
      {readiness.fixes.slice(0, 4).map((f) => (
        <li key={f.criterionId} className="flex gap-2 text-xs">
          <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${f.required ? "text-red-500" : "text-amber-500"}`} />
          <span>
            <span className="font-medium text-slate-800">
              {f.criterionId} {f.status.toLowerCase()}
              {f.required ? " (required)" : ""}
            </span>
            <span className="block text-slate-500">{f.fix}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RiskGauge({ probability = 0, history = [] }) {
  const p = Math.max(0, Math.min(1, probability));
  const angle = Math.PI * (1 - p);
  const x = 60 + 48 * Math.cos(angle);
  const y = 60 - 48 * Math.sin(angle);
  const color = p >= 0.75 ? "#059669" : p >= 0.5 ? "#d97706" : "#dc2626";
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-44" role="img" aria-label={`Approval likelihood ${pct(p)}`}>
        <path d="M12 60 A48 48 0 0 1 108 60" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
        <path d={`M12 60 A48 48 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        <text x="60" y="56" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 18, fontWeight: 600 }}>
          {pct(p)}
        </text>
      </svg>
      <div className="text-xs text-slate-500">Approval likelihood</div>
      {history.length > 1 && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1 text-xs text-slate-600">
          {history.map((h, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300">→</span>}
              <span title={h.label} className="rounded bg-slate-100 px-1.5 py-0.5">
                {pct(h.probability)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const RATIO_FEATURES = ["met_ratio", "evidence_docs"];
const COUNT_FEATURES = ["missing_required", "unclear"];
function formatValue(c) {
  if (RATIO_FEATURES.includes(c.key)) return pct(c.value);
  if (COUNT_FEATURES.includes(c.key)) return c.value;
  return c.value ? "yes" : "no";
}

export function Contributions({ prediction }) {
  if (!prediction) return null;
  const max = Math.max(...prediction.contributions.map((c) => Math.abs(c.contribution)), 0.01);
  return (
    <div className="space-y-1.5">
      {prediction.contributions.slice(0, 7).map((c) => (
        <div key={c.key} className="grid grid-cols-[1fr_120px] items-center gap-2 text-xs">
          <span className="truncate text-slate-600" title={c.label}>
            {c.label} <span className="text-slate-400">({formatValue(c)})</span>
          </span>
          <div className="relative h-3 rounded bg-slate-100">
            <div className="absolute top-0 h-3 w-px bg-slate-300" style={{ left: "50%" }} />
            <div
              className={`absolute top-0 h-3 rounded ${c.contribution >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
              style={c.contribution >= 0 ? { left: "50%", width: `${(c.contribution / max) * 50}%` } : { right: "50%", width: `${(-c.contribution / max) * 50}%` }}
            />
          </div>
        </div>
      ))}
      <p className="pt-1 text-[11px] text-slate-400">Feature contributions to the log-odds (exact SHAP values for this linear model). Green raises approval, red lowers it.</p>
    </div>
  );
}

export function VerifierChecklist({ verifier }) {
  if (!verifier) return <p className="text-sm text-slate-400">Not verified yet.</p>;
  const statusCls = verifier.status === "PASS" ? "bg-emerald-100 text-emerald-800" : verifier.status === "WARN" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`chip ${statusCls}`}>{verifier.status}</span>
        {verifier.retries > 0 && <span className="text-xs text-slate-500">{verifier.retries} writer retr{verifier.retries > 1 ? "ies" : "y"}</span>}
      </div>
      <ul className="space-y-1.5">
        {verifier.checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-xs">
            {c.pass ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" /> : <XCircle size={14} className="mt-0.5 shrink-0 text-red-600" />}
            <span>
              <span className="text-slate-700">{c.label}</span> <span className="text-slate-400">({c.detail})</span>
            </span>
          </li>
        ))}
      </ul>
      {verifier.issues.length > 0 && (
        <ul className="mt-3 space-y-1">
          {verifier.issues.map((i, k) => (
            <li key={k} className={`rounded-md px-2 py-1 text-xs ${i.severity === "high" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
              {i.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const RES = {
  EVIDENCE_ADDED: { label: "Evidence added", cls: "bg-emerald-100 text-emerald-800" },
  REBUTTED: { label: "Rebutted", cls: "bg-emerald-100 text-emerald-800" },
  GAP_CREATED: { label: "Needs clinician", cls: "bg-amber-100 text-amber-800" },
  UNRESOLVED: { label: "Unresolved", cls: "bg-red-100 text-red-700" },
};

/** Insurer Simulator: the payer's reviewer on the left, copilot rebuttal on the right. */
export function Courtroom({ adversarial }) {
  if (!adversarial) return <p className="text-sm text-slate-400">The simulated payer review runs after the packet is drafted.</p>;
  const objections = adversarial.rounds.flatMap((r) => r.objections);
  return (
    <div>
      <div className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${adversarial.status === "SURVIVED" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
        {adversarial.status === "SURVIVED" ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
        {adversarial.status === "SURVIVED" ? "Survived simulated review: no valid denial reason left" : `Would be denied: ${adversarial.blockingRemaining} blocking objection(s) remain`}
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-slate-50 p-2">
          <div className="text-lg font-semibold text-slate-900">{adversarial.roundsRun ?? Math.max(1, adversarial.rounds.length)}</div>review round(s)
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="text-lg font-semibold text-slate-900">
            {adversarial.blockingRaised} → {adversarial.blockingRemaining}
          </div>
          blocking objections
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <div className="text-lg font-semibold text-slate-900">{adversarial.discardedInvalid}</div>invalid (no policy cite) discarded
        </div>
      </div>
      {!objections.length && <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">The simulated reviewer could not find a policy-backed reason to deny this request.</p>}
      <div className="space-y-3">
        {objections.map((o) => (
          <div key={o.id} className="space-y-2">
            <div className="flex gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-100 text-red-700">
                <Building2 size={14} />
              </span>
              <div className="max-w-[90%] rounded-lg rounded-tl-none border border-red-200 bg-red-50 px-3 py-2 text-sm">
                <div className="mb-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-red-800">Simulated payer reviewer · round {o.round}</span>
                  <span className={`chip px-1.5 py-0 ${o.severity === "BLOCKING" ? "bg-red-600 text-white" : "bg-amber-200 text-amber-900"}`}>{o.severity}</span>
                  <span className="font-mono text-red-700">{o.policyCitation}</span>
                </div>
                <p className="text-slate-700">{o.statement}</p>
              </div>
            </div>
            <div className="flex flex-row-reverse gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                <Bot size={14} />
              </span>
              <div className="max-w-[90%] rounded-lg rounded-tr-none border border-brand-200 bg-white px-3 py-2 text-sm">
                <div className="mb-0.5 flex items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-brand-700">Copilot rebuttal</span>
                  <span className={`chip px-1.5 py-0 ${RES[o.resolution.type]?.cls}`}>{RES[o.resolution.type]?.label}</span>
                </div>
                <p className="text-slate-700">{o.resolution.message}</p>
                {o.resolution.quote && (
                  <p className="mt-1 flex gap-1 text-xs italic text-slate-500">
                    <Quote size={12} className="mt-0.5 shrink-0" /> {o.resolution.quote} <span className="not-italic text-slate-400">({o.resolution.docTitle})</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopRisks({ prediction }) {
  if (!prediction?.topRisks?.length) return <p className="text-xs text-slate-500">No significant risk factors.</p>;
  return (
    <ul className="space-y-2">
      {prediction.topRisks.map((r) => (
        <li key={r.label} className="flex gap-2 text-xs">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <span>
            <span className="font-medium text-slate-800">{r.label}</span>
            <span className="block text-slate-500">Fix: {r.fix}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

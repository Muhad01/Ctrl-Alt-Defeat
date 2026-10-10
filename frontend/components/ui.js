"use client";
import { Loader2 } from "lucide-react";
import { STATUS_META, pct } from "@/lib/format";

export function StatusChip({ status }) {
  const m = STATUS_META[status] || { label: status, cls: "bg-slate-100 text-slate-700" };
  return <span className={`chip ${m.cls}`}>{m.label}</span>;
}

export function RiskBadge({ risk }) {
  if (!risk) return <span className="text-xs text-slate-400">–</span>;
  const cls = risk.level === "LOW" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : risk.level === "MEDIUM" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-red-50 text-red-700 ring-red-200";
  return <span className={`chip ring-1 ${cls}`}>{pct(risk.probability)} approval</span>;
}

export function ReadinessBadge({ readiness }) {
  if (!readiness) return <span className="text-xs text-slate-400">–</span>;
  const cls = readiness.level === "READY" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : readiness.level === "NEEDS_WORK" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-red-50 text-red-700 ring-red-200";
  return <span className={`chip ring-1 ${cls}`}>{readiness.score}/100</span>;
}

export function MockBadge({ children = "MOCK POLICY" }) {
  return <span className="chip bg-slate-800 px-1.5 py-0 text-[10px] font-semibold tracking-wide text-white">{children}</span>;
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-2 py-16 text-sm text-slate-500 justify-center">
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>;
}

export function Kpi({ label, value, hint, icon: Icon }) {
  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
        {Icon && <Icon size={16} className="text-slate-400" />}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function ModeTag({ mode }) {
  if (!mode) return null;
  const map = { claude: "bg-violet-100 text-violet-700", mistral: "bg-orange-100 text-orange-700", groq: "bg-rose-100 text-rose-700", ollama: "bg-emerald-100 text-emerald-700", rules: "bg-slate-100 text-slate-600", rag: "bg-sky-100 text-sky-700", ml: "bg-teal-100 text-teal-700" };
  const label = { claude: "Claude", mistral: "Mistral", groq: "Groq", ollama: "Ollama", rules: "rules", rag: "RAG", ml: "ML" }[mode] || mode;
  return <span className={`chip ${map[mode] || "bg-slate-100 text-slate-600"} px-1.5 py-0 text-[10px] uppercase`}>{label}</span>;
}

/** Renders our letter markdown subset (#, ##, -, **bold**) with clickable citation chips. */
export function MarkdownLetter({ text, citations = [], onCite }) {
  const renderInline = (line, key) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\[\d+\])/g).filter(Boolean);
    return parts.map((p, i) => {
      if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={`${key}-${i}`}>{p.slice(2, -2)}</strong>;
      const m = p.match(/^\[(\d+)\]$/);
      if (m) {
        const c = citations.find((x) => x.n === Number(m[1]));
        return (
          <button
            key={`${key}-${i}`}
            type="button"
            onClick={() => c && onCite?.(c)}
            title={c ? `"${c.quote}" (${c.docTitle})` : "Unknown citation"}
            className={`mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded px-1 align-text-top text-[10px] font-semibold ${c ? "bg-brand-100 text-brand-700 hover:bg-brand-200" : "bg-red-100 text-red-700"}`}
          >
            {m[1]}
          </button>
        );
      }
      return <span key={`${key}-${i}`}>{p}</span>;
    });
  };
  const lines = (text || "").split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-700">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) return <h3 key={i} className="pb-1 text-lg font-semibold text-slate-900">{line.slice(2)}</h3>;
        if (line.startsWith("## ")) return <h4 key={i} className="pt-3 text-sm font-semibold uppercase tracking-wide text-slate-900">{line.slice(3)}</h4>;
        if (line.startsWith("- ")) return <div key={i} className="flex gap-2 pl-1"><span className="text-slate-400">•</span><div>{renderInline(line.slice(2), i)}</div></div>;
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line, i)}</p>;
      })}
    </div>
  );
}

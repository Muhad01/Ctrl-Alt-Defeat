"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Clock, Gauge, ShieldCheck, ArrowRight, AlertTriangle, FilePlus2, Inbox, Gavel, FileCheck2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { STATUS_META } from "@/lib/format";
import { PageHeader, Kpi, Loading, ErrorBox } from "@/components/ui";
import { SimpleBar } from "@/components/charts";

// Fill colour per status for the pipeline bar (same hue families as the status chips).
const BAR = {
  NEEDS_INFO: "bg-amber-400", READY_FOR_REVIEW: "bg-brand-600", APPROVED_BY_HUMAN: "bg-brand-400", SUBMITTED: "bg-sky-400",
  APPROVED: "bg-emerald-500", OVERTURNED: "bg-emerald-400", DENIED: "bg-red-500", UPHELD: "bg-red-400", APPEAL_DRAFTED: "bg-orange-400",
  APPEAL_SUBMITTED: "bg-sky-500", REJECTED: "bg-gray-400", ERROR: "bg-red-600",
};

// Icon per attention item kind (falls back to a warning icon).
const KIND_ICON = [
  [/gap|info/i, AlertTriangle, "bg-amber-50 text-amber-700 ring-amber-100"],
  [/review|ready/i, FileCheck2, "bg-brand-50 text-brand-700 ring-brand-100"],
  [/denial|appeal|denied/i, Gavel, "bg-red-50 text-red-700 ring-red-100"],
];
const kindStyle = (kind) => KIND_ICON.find(([re]) => re.test(kind)) || [null, AlertTriangle, "bg-gray-50 text-gray-600 ring-gray-200"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => api.get("/analytics/summary").then(setData).catch((e) => setError(e.message));
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Loading />;
  const k = data.kpis;
  const total = data.statusCounts.reduce((s, x) => s + x.count, 0);

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user.name.replace(/^Dr\.?\s+/i, "").split(" ")[0]}`}
        subtitle={`${new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}. Here is today's prior authorization workload.`}
        actions={
          user.role !== "manager" && (
            <Link href="/cases/new" className="btn-primary">
              <FilePlus2 size={16} /> New case
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi accent label="Open cases" value={k.openCases} hint={`${k.casesWithGaps} with open documentation gaps`} icon={FolderKanban} />
        <Kpi label="Avg readiness (open)" value={k.avgReadiness == null ? "–" : `${k.avgReadiness}/100`} hint="Rule-based checklist score, not an approval probability" icon={Gauge} />
        <Kpi label="Turnaround per request" value={`${k.manualBaselineMinutes} → ${k.copilotMinutes} min`} hint={k.avgAgentSeconds ? `Estimated. Agents finish in about ${Math.max(1, Math.round(k.avgAgentSeconds))}s (measured)` : "Estimated. Run a case to measure agent time"} icon={Clock} />
        <Kpi label="Staff hours saved (est.)" value={k.hoursSaved.toFixed(1)} hint={`${k.preventableDenialsCaught} likely rejections caught before submission`} icon={ShieldCheck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card min-w-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2>Needs your attention</h2>
              <p className="mt-0.5 text-xs text-gray-500">{data.needsAttention.length ? `${data.needsAttention.length} item(s) waiting on a person` : "All caught up"}</p>
            </div>
            <Link href="/cases" className="btn-ghost btn-sm">
              View queue <ArrowRight size={14} />
            </Link>
          </div>
          {data.needsAttention.length ? (
            <ul className="divide-y divide-gray-100">
              {data.needsAttention.map((n) => {
                const [, Icon, cls] = kindStyle(n.kind);
                return (
                  <li key={n.caseId + n.kind}>
                    <Link href={`/cases/${n.caseId}`} className="group flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-gray-50/80">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${cls}`}>
                          <Icon size={16} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-ink">
                            {n.kind}
                            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-normal text-gray-500">{n.caseId}</span>
                          </div>
                          <div className="truncate text-xs text-gray-500">{n.detail}</div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-ink" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Inbox size={20} />
              </span>
              <p className="text-sm font-medium text-ink">Nothing needs attention right now</p>
              <p className="max-w-xs text-xs text-gray-500">New gaps, packets ready for review and denials will appear here.</p>
            </div>
          )}
        </section>

        <section className="card card-pad">
          <div className="flex items-baseline justify-between">
            <h2>Pipeline</h2>
            <span className="text-xs text-gray-500">{total} cases</span>
          </div>
          {total > 0 && (
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-gray-100" role="img" aria-label="Cases by status">
              {data.statusCounts.map((s) => (
                <div key={s.status} className={`${BAR[s.status] || "bg-gray-300"} border-r-2 border-white last:border-r-0`} style={{ width: `${(100 * s.count) / total}%` }} title={`${STATUS_META[s.status]?.label || s.status}: ${s.count}`} />
              ))}
            </div>
          )}
          <ul className="mt-5 space-y-2.5">
            {data.statusCounts.map((s) => (
              <li key={s.status} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className={`h-2.5 w-2.5 rounded-sm ${BAR[s.status] || "bg-gray-300"}`} aria-hidden="true" />
                  {STATUS_META[s.status]?.label || s.status}
                </span>
                <span className="font-medium tabular-nums text-ink">{s.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card card-pad mt-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2>Requests per day</h2>
          <span className="text-xs text-gray-500">Last 14 days. Includes synthetic history used to train the denial predictor.</span>
        </div>
        <div className="mt-4">
          <SimpleBar data={data.perDay} x="date" y="cases" name="Requests" />
        </div>
      </section>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Clock, Gauge, ShieldCheck, ArrowRight, AlertTriangle, FilePlus2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { pct } from "@/lib/format";
import { PageHeader, Kpi, Loading, ErrorBox, StatusChip } from "@/components/ui";
import { SimpleBar } from "@/components/charts";

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

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        subtitle="Today's prior authorization workload"
        actions={
          user.role !== "manager" && (
            <Link href="/cases/new" className="btn-primary">
              <FilePlus2 size={16} /> New case
            </Link>
          )
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Open cases" value={k.openCases} hint={`${k.casesWithGaps} with open documentation gaps`} icon={FolderKanban} />
        <Kpi label="Avg readiness (open)" value={k.avgReadiness == null ? "–" : `${k.avgReadiness}/100`} hint="Rule-based checklist score, not an approval probability" icon={Gauge} />
        <Kpi label="Turnaround per request" value={`${k.manualBaselineMinutes} → ${k.copilotMinutes} min`} hint={k.avgAgentSeconds ? `Estimated. Agents finish in ~${Math.max(1, Math.round(k.avgAgentSeconds))}s (measured)` : "Estimated. Run a case to measure agent time"} icon={Clock} />
        <Kpi label="Staff hours saved (est.)" value={k.hoursSaved.toFixed(1)} hint={`${k.preventableDenialsCaught} likely rejections caught before submission`} icon={ShieldCheck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card min-w-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h2>Needs your attention</h2>
            <Link href="/cases" className="text-xs text-brand-600 hover:underline">
              View queue →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.needsAttention.map((n) => (
              <li key={n.caseId + n.kind}>
                <Link href={`/cases/${n.caseId}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="flex min-w-0 items-start gap-3">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">
                        {n.kind} · <span className="font-mono text-xs text-slate-500">{n.caseId}</span>
                      </div>
                      <div className="truncate text-xs text-slate-500">{n.detail}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-slate-400" />
                </Link>
              </li>
            ))}
            {!data.needsAttention.length && <li className="px-5 py-6 text-sm text-slate-500">Nothing needs attention right now.</li>}
          </ul>
        </div>

        <div className="card card-pad">
          <h2>Cases by status</h2>
          <div className="mt-3 space-y-2">
            {data.statusCounts.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <StatusChip status={s.status} />
                <span className="text-sm font-medium text-slate-700">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad mt-6">
        <h2>Requests per day (last 14 days)</h2>
        <p className="mb-2 text-xs text-slate-500">Includes synthetic historical requests used to train the denial predictor.</p>
        <SimpleBar data={data.perDay} x="date" y="cases" name="Requests" />
      </div>
    </div>
  );
}

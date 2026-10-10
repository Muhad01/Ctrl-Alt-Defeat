"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, FilePlus2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { STATUS_META, timeAgo } from "@/lib/format";
import { PageHeader, StatusChip, ReadinessBadge, Loading, ErrorBox } from "@/components/ui";


export default function CaseQueue() {
  const router = useRouter();
  const { user, meta } = useAuth();
  const PAYERS = meta.payers;
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", status: "", payer: "", risk: "" });

  useEffect(() => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    const load = () => api.get(`/cases?${params}`).then(setRows).catch((e) => setError(e.message));
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [filters]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  // urgency sort: things a human must act on first
  const order = ["NEEDS_INFO", "READY_FOR_REVIEW", "DENIED", "APPEAL_DRAFTED"];
  const sorted = rows ? [...rows].sort((a, b) => (order.indexOf(a.status) + 1 || 99) - (order.indexOf(b.status) + 1 || 99)) : null;

  return (
    <div>
      <PageHeader
        title="Case queue"
        subtitle="Sorted by urgency. Patient names are masked."
        actions={
          user.role !== "manager" && (
            <Link href="/cases/new" className="btn-primary">
              <FilePlus2 size={16} /> New case
            </Link>
          )
        }
      />
      <div className="card mb-4 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input pl-9" placeholder="Search case, procedure, payer" value={filters.q} onChange={set("q")} />
        </div>
        <select className="input" value={filters.status} onChange={set("status")}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select className="input" value={filters.payer} onChange={set("payer")}>
          <option value="">All payers</option>
          {PAYERS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select className="input" value={filters.risk} onChange={set("risk")}>
          <option value="">All readiness levels</option>
          <option value="NOT_READY">Not ready (under 60)</option>
          <option value="NEEDS_WORK">Needs work (60-84)</option>
          <option value="READY">Ready (85+)</option>
        </select>
      </div>
      <ErrorBox error={error} />
      {!sorted ? (
        <Loading />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base min-w-[860px]">
            <thead>
              <tr>
                <th>Case</th>
                <th>Patient</th>
                <th>Procedure</th>
                <th>Payer</th>
                <th>Status</th>
                <th>Readiness</th>
                <th>Assigned</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} onClick={() => router.push(`/cases/${r.id}`)} className="cursor-pointer hover:bg-slate-50">
                  <td className="font-mono text-xs font-medium text-brand-700">{r.id}</td>
                  <td>{r.patient}</td>
                  <td>
                    {r.procedure} <span className="font-mono text-xs text-slate-400">{r.cpt}</span>
                  </td>
                  <td>{r.payer}</td>
                  <td>
                    <StatusChip status={r.status} />
                    {r.openGaps > 0 && <span className="ml-1.5 text-xs text-amber-700">{r.openGaps} gap(s)</span>}
                  </td>
                  <td>
                    <ReadinessBadge readiness={r.readiness} />
                  </td>
                  <td className="text-xs text-slate-500">{r.assignedTo}</td>
                  <td className="text-xs text-slate-500">{timeAgo(r.updatedAt)}</td>
                </tr>
              ))}
              {!sorted.length && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No cases match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

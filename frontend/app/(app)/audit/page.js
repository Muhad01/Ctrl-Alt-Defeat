"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, User, Server, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import { PageHeader, Loading, ErrorBox } from "@/components/ui";

const ACTOR = { agent: { icon: Bot, cls: "bg-violet-100 text-violet-700" }, human: { icon: User, cls: "bg-emerald-100 text-emerald-700" }, system: { icon: Server, cls: "bg-slate-100 text-slate-600" } };

export default function Audit() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [actorType, setActorType] = useState("");
  const [caseId, setCaseId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(Object.entries({ actorType, caseId }).filter(([, v]) => v));
    api.get(`/audit?${params}`).then(setRows).catch((e) => setError(e.message));
  }, [actorType, caseId]);

  return (
    <div>
      <PageHeader title="Audit log" subtitle="Append-only record of every AI output and human decision." />
      <div className="card mb-4 grid gap-3 p-3 sm:grid-cols-3">
        <select className="input" value={actorType} onChange={(e) => setActorType(e.target.value)}>
          <option value="">All actors</option>
          <option value="agent">AI agents</option>
          <option value="human">Humans</option>
          <option value="system">System</option>
        </select>
        <input className="input" placeholder="Filter by case ID (e.g., C-1001)" value={caseId} onChange={(e) => setCaseId(e.target.value.trim())} />
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Lock size={13} /> Entries cannot be edited or deleted
        </div>
      </div>
      <ErrorBox error={error} />
      {!rows ? (
        <Loading />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base min-w-[800px]">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Case</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const A = ACTOR[r.actorType] || ACTOR.system;
                return (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap text-xs text-slate-500">{fmtDateTime(r.createdAt)}</td>
                    <td>
                      <span className={`chip ${A.cls}`}>
                        <A.icon size={12} /> {r.actorId}
                      </span>
                    </td>
                    <td className="font-mono text-xs">{r.action}</td>
                    <td>
                      {r.caseId ? (
                        <Link href={`/cases/${r.caseId}`} className="font-mono text-xs text-brand-700 hover:underline">
                          {r.caseId}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">–</span>
                      )}
                    </td>
                    <td className="max-w-md truncate font-mono text-[11px] text-slate-500" title={JSON.stringify(r.payload)}>
                      {Object.keys(r.payload || {}).length ? JSON.stringify(r.payload) : ""}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No entries.
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

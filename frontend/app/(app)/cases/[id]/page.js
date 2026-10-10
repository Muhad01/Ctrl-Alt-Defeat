"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileCheck2, Gavel, RefreshCw, Radio, User, Stethoscope, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCase } from "@/components/useCase";
import { StatusChip, Loading, ErrorBox, MockBadge } from "@/components/ui";
import AgentTimeline from "@/components/AgentTimeline";
import CriteriaChecklist from "@/components/CriteriaChecklist";
import ChartViewer from "@/components/ChartViewer";
import GapPanel from "@/components/GapPanel";
import { ReadinessGauge, ReadinessFixes } from "@/components/Insights";
import CoveragePanel from "@/components/CoveragePanel";

const INSURER_CHANGEABLE = ["DRAFT", "NEEDS_INFO", "READY_FOR_REVIEW", "ERROR", "REJECTED"];

export default function Workspace() {
  const { id } = useParams();
  const { user, meta } = useAuth();
  const { data: c, error, setError, reload, live } = useCase(id);
  const [active, setActive] = useState(null);
  const [switching, setSwitching] = useState(false);

  async function changeInsurer(payer) {
    setSwitching(true);
    setError("");
    try {
      await api.post(`/cases/${c.id}/insurer`, { payer });
      setActive(null);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSwitching(false);
    }
  }

  const highlights = useMemo(() => (c ? c.criteria.flatMap((r) => r.evidence || []) : []), [c]);

  if (error && !c) return <ErrorBox error={error} />;
  if (!c) return <Loading />;

  const hasPacket = Boolean(c.packet);
  const denied = ["DENIED", "APPEAL_DRAFTED", "APPEAL_SUBMITTED", "OVERTURNED", "UPHELD"].includes(c.status);
  const met = c.criteria.filter((r) => r.status === "MET").length;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono">{c.id}</h1>
            <StatusChip status={c.status} />
            <MockBadge>SYNTHETIC PATIENT</MockBadge>
            <span className={`flex items-center gap-1 text-xs ${live ? "text-emerald-600" : "text-slate-400"}`}>
              <Radio size={12} /> {live ? "live" : "offline"}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <User size={14} /> {c.patient.name}, {c.patient.age}
              {c.patient.sex} · {c.patient.mrn}
            </span>
            <span>{c.coding?.procedureShort || c.order.cpt} · CPT {c.order.cpt}</span>
            <label className="flex items-center gap-1.5" title="Re-check the same chart against another insurer's policy">
              <Building2 size={14} />
              <select
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm disabled:bg-slate-50"
                value={c.order.payer || c.patient.payer}
                disabled={switching || user.role === "manager" || !INSURER_CHANGEABLE.includes(c.status)}
                onChange={(e) => changeInsurer(e.target.value)}
              >
                <optgroup label="Real insurers (Pakistan, public plan terms)">
                  {meta.realPayers.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </optgroup>
                <optgroup label="Mock payers (demo)">
                  {meta.payers.filter((p) => !meta.realPayers.includes(p)).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </optgroup>
              </select>
            </label>
            <span className="flex items-center gap-1">
              <Stethoscope size={14} /> {c.patient.provider.name}
            </span>
          </div>
          {c.coding?.icd10?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {c.coding.icd10.map((d) => (
                <span key={d.code} className="chip bg-slate-100 text-slate-700" title={d.evidence}>
                  <span className="font-mono">{d.code}</span> {d.desc}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => api.post(`/cases/${c.id}/rerun`).then(reload)} title="Re-run all agents">
            <RefreshCw size={15} /> Re-run
          </button>
          {hasPacket && (
            <Link href={`/cases/${c.id}/packet`} className="btn-primary">
              <FileCheck2 size={15} /> {c.status === "READY_FOR_REVIEW" ? "Review packet" : "View packet"}
            </Link>
          )}
          {denied && (
            <Link href={`/cases/${c.id}/appeal`} className="btn-danger">
              <Gavel size={15} /> Denial & appeal
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="card flex max-h-[calc(100vh-200px)] flex-col">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2>Patient chart</h2>
            <p className="text-xs text-slate-500">Highlighted text is cited evidence</p>
          </div>
          <div className="overflow-y-auto p-4">
            <ChartViewer documents={c.documents} highlights={highlights} active={active} />
          </div>
        </section>

        <section className="card flex max-h-[calc(100vh-200px)] flex-col">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2>Criteria vs. evidence</h2>
            <p className="text-xs text-slate-500">{c.criteria.length ? `${met} of ${c.criteria.length} criteria met` : "Waiting for matcher"}</p>
          </div>
          <div className="overflow-y-auto p-4">
            <CriteriaChecklist criteria={c.criteria} policy={c.policy} activeQuote={active?.quote} onSelectEvidence={setActive} />
          </div>
        </section>

        <section className="space-y-5">
          {c.coverage && (
            <div className="card card-pad">
              <h2 className="mb-3">Plan coverage check</h2>
              <CoveragePanel coverage={c.coverage} compact />
            </div>
          )}
          {c.gaps.length > 0 && (
            <div className="card card-pad">
              <h2 className="mb-3">Documentation gaps</h2>
              <GapPanel caseData={c} user={user} onChange={reload} />
            </div>
          )}
          {c.readiness && (
            <div className="card card-pad">
              <ReadinessGauge readiness={c.readiness} history={c.predictionHistory} />
              <div className="mt-3 border-t border-slate-100 pt-3">
                <ReadinessFixes readiness={c.readiness} />
              </div>
            </div>
          )}
          <div className="card card-pad">
            <h2 className="mb-3">Agent timeline</h2>
            <div className="max-h-[480px] overflow-y-auto pr-1">
              <AgentTimeline timeline={c.timeline} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

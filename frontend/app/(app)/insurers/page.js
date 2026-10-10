"use client";
import { useEffect, useState } from "react";
import { Landmark, ExternalLink, ShieldCheck, ShieldX, Clock, Users, Building2, Search, Loader2, Info } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader, Loading, ErrorBox } from "@/components/ui";
import CoveragePanel, { COVERAGE_STATUS } from "@/components/CoveragePanel";

const SERVICE_LABEL = { inpatient: "Inpatient hospitalization", outpatient_imaging: "Outpatient MRI / CT", day_care: "Day-care procedures", maternity: "Maternity" };
const SERVICE_CLS = { COVERED: "bg-emerald-50 text-emerald-700", OPTIONAL: "bg-sky-50 text-sky-700", CONDITIONAL: "bg-amber-50 text-amber-700", NOT_COVERED: "bg-red-50 text-red-700", UNSTATED: "bg-slate-100 text-slate-500" };

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon size={13} /> {title}
      </h3>
      {children}
    </div>
  );
}

function InsurerCard({ ins }) {
  return (
    <div className="card card-pad">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg">{ins.company}</h2>
          <p className="text-sm text-slate-600">
            {ins.plan} · <span className="text-slate-500">{ins.type}</span>
          </p>
        </div>
        <span className="chip shrink-0 bg-slate-800 text-[10px] font-semibold tracking-wide text-white">REAL PLAN, PUBLIC INFO</span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-800">{ins.limits.summary}.</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.entries(ins.services).map(([k, v]) => (
          <span key={k} className={`chip ${SERVICE_CLS[v.status]}`} title={v.text}>
            {SERVICE_LABEL[k]}: {v.status.replace("_", " ").toLowerCase()}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Section icon={ShieldCheck} title="Covered conditions and services">
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-700">
            {ins.coveredConditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {ins.inadmissible.length > 0 && <p className="mt-2 text-xs text-red-700">Inadmissible: {ins.inadmissible.join(", ")}</p>}
        </Section>
        <Section icon={ShieldX} title="Key exclusions">
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-700">
            {ins.exclusions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Section>
        <Section icon={Clock} title="Pre-authorization">
          <p className="text-sm text-slate-700">{ins.preAuth.planned.rule}</p>
          <p className="mt-1 text-sm text-slate-700">{ins.preAuth.emergency.rule}</p>
          {ins.preAuth.planned.quote && <p className="mt-1 text-xs italic text-slate-500">&ldquo;{ins.preAuth.planned.quote}&rdquo;</p>}
          <p className="mt-1 text-xs text-slate-500">{ins.preAuth.reimbursement}</p>
        </Section>
        <Section icon={Users} title="Eligibility, waiting period, pre-existing">
          <p className="text-sm text-slate-700">{ins.eligibility.note}</p>
          <p className="mt-1 text-sm text-slate-700">{ins.waitingPeriod.note}</p>
          <p className="mt-1 text-sm text-slate-700">Pre-existing: {ins.preExisting}</p>
        </Section>
        <Section icon={Building2} title="Outpatient MRI rule">
          <p className="text-sm text-slate-700">{ins.services.outpatient_imaging.text}</p>
          {ins.services.outpatient_imaging.quote && <p className="mt-1 text-xs italic text-slate-500">&ldquo;{ins.services.outpatient_imaging.quote}&rdquo; ({ins.services.outpatient_imaging.ref})</p>}
        </Section>
        <Section icon={Building2} title="Network">
          <p className="text-sm text-slate-700">{ins.network}</p>
          {ins.policies.length > 0 && <p className="mt-1 text-xs text-slate-500">In this app: {ins.policies.map((p) => p.id).join(", ")}</p>}
        </Section>
      </div>

      <div className="mt-4 space-y-0.5 border-t border-slate-100 pt-3">
        {ins.sources.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand-700 hover:underline">
            <ExternalLink size={12} /> {s.title}. Retrieved {s.retrieved}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Insurers() {
  const { meta } = useAuth();
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ payer: "", cpt: "73721", age: 45, setting: "outpatient" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/insurers")
      .then((d) => {
        setList(d);
        setForm((f) => ({ ...f, payer: d[0]?.payer || "" }));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function check(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setResult(await api.post("/insurers/coverage-check", form));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !list) return <ErrorBox error={error} />;
  if (!list) return <Loading />;

  return (
    <div>
      <PageHeader title="Insurers (Pakistan)" subtitle="Real health plans from major Pakistani insurers and the government Sehat programme, taken from their own public documents." />
      <div className="mb-5 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          Coverage, limits, pre-authorization rules, covered conditions and exclusions come from each insurer&apos;s public brochure or product page (links below, retrieved 10 Oct 2026). Plans change, so verify with the insurer. None of these insurers publish clinical criteria for MRI, so the clinical checklist used for them in cases is a <span className="font-medium">demo template</span>. There is no reliable public ranking of the &ldquo;best&rdquo; health insurer in Pakistan, so these are listed as major providers, not ranked.
        </span>
      </div>

      <div className="card card-pad mb-6">
        <h2 className="mb-3 flex items-center gap-2">
          <Search size={16} /> Coverage lookup
        </h2>
        <form onSubmit={check} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select className="input lg:col-span-2" value={form.payer} onChange={(e) => setForm({ ...form, payer: e.target.value })}>
            {list.map((i) => (
              <option key={i.payer} value={i.payer}>
                {i.payer}
              </option>
            ))}
          </select>
          <select className="input" value={form.cpt} onChange={(e) => setForm({ ...form, cpt: e.target.value })}>
            {meta.procedures.map((p) => (
              <option key={p.cpt} value={p.cpt}>
                {p.short} ({p.cpt})
              </option>
            ))}
          </select>
          <select className="input" value={form.setting} onChange={(e) => setForm({ ...form, setting: e.target.value })}>
            <option value="outpatient">Outpatient test</option>
            <option value="inpatient">During an admission</option>
          </select>
          <div className="flex gap-2">
            <input className="input" type="number" min="0" max="100" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} aria-label="Patient age" />
            <button className="btn-primary shrink-0" disabled={busy}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : "Check"}
            </button>
          </div>
        </form>
        {result && (
          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <CoveragePanel coverage={result} />
          </div>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="table-base min-w-[560px]">
            <thead>
              <tr>
                <th>Insurer / plan</th>
                <th>Outpatient MRI</th>
                <th>Annual limit</th>
                <th>Planned admission pre-auth</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => {
                const st = i.services.outpatient_imaging.status;
                return (
                  <tr key={i.id}>
                    <td className="font-medium">{i.payer}</td>
                    <td>
                      <span className={`chip ${COVERAGE_STATUS[st === "CONDITIONAL" ? "CONDITIONAL" : st === "COVERED" ? "COVERED" : "NOT_COVERED"].cls}`}>{st.replace("_", " ").toLowerCase()}</span>
                    </td>
                    <td className="text-xs">{i.limits.annual ? `Up to PKR ${i.limits.annual.toLocaleString()}` : "By plan"}</td>
                    <td className="text-xs">{i.preAuth.planned.hoursBefore ? `${i.preAuth.planned.hoursBefore} hours before admission` : "Via network hospital"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-5">
        {list.map((ins) => (
          <InsurerCard key={ins.id} ins={ins} />
        ))}
      </div>
    </div>
  );
}

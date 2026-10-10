"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, FileText, UserPlus } from "lucide-react";
import { api, uploadFiles } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader, ErrorBox, Loading } from "@/components/ui";
import ReportUploader from "@/components/ReportUploader";

const CUSTOM = "CUSTOM";
const SETTING_FOR_BENEFIT = { inpatient: "inpatient", day_care: "day_care", outpatient_imaging: "outpatient" };

export default function NewCase() {
  const router = useRouter();
  const { meta, user } = useAuth();
  const [patients, setPatients] = useState(null);
  const [tab, setTab] = useState("sample");
  const [patientId, setPatientId] = useState("");
  const [preview, setPreview] = useState(null);
  const [order, setOrder] = useState({ cpt: "73721", procedureName: "", kind: "therapeutic", setting: "outpatient", reason: "", urgency: "routine", payer: "" });
  const [upload, setUpload] = useState({ name: "", dob: "", sex: "F", payer: "Medicare", memberId: "", specialty: "", noteTitle: "Clinical note", noteText: "" });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const bySpecialty = useMemo(() => {
    const groups = {};
    for (const p of meta.procedures) (groups[p.specialty || "Other"] ||= []).push(p);
    return Object.entries(groups);
  }, [meta.procedures]);

  useEffect(() => {
    api.get("/patients").then(setPatients).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!patientId) return setPreview(null);
    const p = patients?.find((x) => x.id === patientId);
    if (p) setOrder((o) => ({ ...o, payer: p.payer, ...(p.defaultOrder ? { cpt: p.defaultOrder.cpt, reason: p.defaultOrder.reason, setting: settingFor(p.defaultOrder.cpt) } : {}) }));
    api.get(`/patients/${patientId}`).then(setPreview);
  }, [patientId, patients]); // eslint-disable-line react-hooks/exhaustive-deps

  if (user.role === "manager") return <ErrorBox error="Managers cannot create cases. Switch to the coordinator or physician account." />;
  if (!patients) return <Loading />;

  function settingFor(cpt) {
    const p = meta.procedures.find((x) => x.cpt === cpt);
    return p ? SETTING_FOR_BENEFIT[p.benefit] || "outpatient" : "outpatient";
  }

  async function run() {
    setError("");
    try {
      let pid = patientId;
      if (tab === "upload") {
        setBusy("Creating patient…");
        const p = await api.post("/patients", upload);
        pid = p.id;
      }
      if (!pid) throw new Error("Select a patient");
      if (files.length) {
        setBusy(`Uploading ${files.length} file(s)…`);
        await uploadFiles(pid, files);
      }
      setBusy("Starting copilot…");
      const custom = order.cpt === CUSTOM;
      const c = await api.post("/cases", {
        patientId: pid,
        cpt: order.cpt,
        procedureName: custom ? order.procedureName : undefined,
        kind: custom ? order.kind : undefined,
        setting: order.setting,
        reason: order.reason || undefined,
        urgency: order.urgency,
        payer: (tab === "upload" ? upload.payer : order.payer) || undefined,
      });
      router.push(`/cases/${c.id}`);
    } catch (e) {
      setError(e.message);
      setBusy("");
    }
  }

  const setU = (k) => (e) => setUpload((u) => ({ ...u, [k]: e.target.value }));
  const custom = order.cpt === CUSTOM;
  const hasEvidence = tab === "sample" ? Boolean(patientId) : Boolean(upload.name && (upload.noteText.trim() || files.length));
  const canRun = !busy && hasEvidence && (!custom || order.procedureName.trim());

  return (
    <div>
      <PageHeader title="New prior authorization case" subtitle="Any procedure, test, surgery or treatment. Pick a patient (or add a new one), attach their reports and scans, and run the copilot." />
      <ErrorBox error={error} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="card card-pad">
            <div className="mb-4 flex gap-2">
              <button className={tab === "sample" ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setTab("sample")}>
                <FileText size={14} /> Existing patient
              </button>
              <button className={tab === "upload" ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setTab("upload")}>
                <UserPlus size={14} /> New patient
              </button>
            </div>
            {tab === "sample" ? (
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {patients.map((p) => (
                  <label key={p.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${patientId === p.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <input type="radio" name="patient" className="mt-1" checked={patientId === p.id} onChange={() => setPatientId(p.id)} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">
                        {p.name} <span className="font-normal text-slate-500">· {p.age}{p.sex} · {p.payer}</span>
                      </div>
                      <div className="text-xs text-slate-500">{p.scenario || "Uploaded patient"}</div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Patient name</label>
                  <input className="input" value={upload.name} onChange={setU("name")} />
                </div>
                <div>
                  <label className="label">Date of birth</label>
                  <input className="input" type="date" value={upload.dob} onChange={setU("dob")} />
                </div>
                <div>
                  <label className="label">Sex</label>
                  <select className="input" value={upload.sex} onChange={setU("sex")}>
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                  </select>
                </div>
                <div>
                  <label className="label">Insurer</label>
                  <select className="input" value={upload.payer} onChange={setU("payer")}>
                    {meta.payers.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Member ID (optional)</label>
                  <input className="input" value={upload.memberId} onChange={setU("memberId")} />
                </div>
                <div>
                  <label className="label">Treating specialty</label>
                  <input className="input" placeholder="e.g., Cardiology" value={upload.specialty} onChange={setU("specialty")} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Clinical note (optional if you upload reports)</label>
                  <textarea className="input min-h-[140px] font-mono text-xs" placeholder="Paste the visit note: history, examination, treatments tried, assessment and plan…" value={upload.noteText} onChange={setU("noteText")} />
                </div>
              </div>
            )}

            <div className="mt-5">
              <label className="label">Reports, scans and test results</label>
              <ReportUploader files={files} onChange={setFiles} />
              <p className="mt-1.5 text-xs text-slate-500">The Report Reader agent extracts the text (AI vision for scans and photos), flags key findings, and adds each file to the chart. Every claim in the packet must still quote the chart word for word.</p>
            </div>
          </div>

          <div className="card card-pad">
            <h2 className="mb-3">Order</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="label">Procedure, test or treatment</label>
                <select className="input" value={order.cpt} onChange={(e) => setOrder({ ...order, cpt: e.target.value, setting: e.target.value === CUSTOM ? order.setting : settingFor(e.target.value) })}>
                  {bySpecialty.map(([specialty, list]) => (
                    <optgroup key={specialty} label={specialty}>
                      {list.map((p) => (
                        <option key={p.cpt} value={p.cpt}>
                          {p.short} (CPT {p.cpt})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <optgroup label="Not in the list">
                    <option value={CUSTOM}>Other procedure: type its name…</option>
                  </optgroup>
                </select>
              </div>
              {custom && (
                <>
                  <div className="sm:col-span-2">
                    <label className="label">Procedure name</label>
                    <input className="input" placeholder="e.g., Kidney transplant, Tonsillectomy, Dialysis, Insulin pump" value={order.procedureName} onChange={(e) => setOrder({ ...order, procedureName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select className="input" value={order.kind} onChange={(e) => setOrder({ ...order, kind: e.target.value })}>
                      <option value="therapeutic">Treatment / surgery</option>
                      <option value="diagnostic">Diagnostic test</option>
                    </select>
                  </div>
                  <p className="-mt-1 text-xs text-slate-500 sm:col-span-3">Checked against the insurer&apos;s general medical-necessity policy, since there is no procedure-specific one.</p>
                </>
              )}
              {tab === "sample" && (
                <div className="sm:col-span-3">
                  <label className="label">Insurer (policy to check against)</label>
                  <select className="input" value={order.payer} onChange={(e) => setOrder({ ...order, payer: e.target.value })} disabled={!patientId}>
                    {!patientId && <option value="">Select a patient first</option>}
                    {[
                      ["Real insurers (Pakistan, public plan terms)", meta.realPayers],
                      ["Mock payers (demo)", meta.payers.filter((p) => !meta.realPayers.includes(p))],
                    ].map(([label, group]) => (
                      <optgroup key={label} label={label}>
                        {group.map((p) => (
                          <option key={p} value={p}>
                            {p}
                            {p === patients.find((x) => x.id === patientId)?.payer ? " (patient plan)" : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="label">Care setting</label>
                <select className="input" value={order.setting} onChange={(e) => setOrder({ ...order, setting: e.target.value })}>
                  <option value="outpatient">Outpatient</option>
                  <option value="day_care">Day-care</option>
                  <option value="inpatient">Inpatient admission</option>
                </select>
              </div>
              <div>
                <label className="label">Urgency</label>
                <select className="input" value={order.urgency} onChange={(e) => setOrder({ ...order, urgency: e.target.value })}>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="label">Clinical reason</label>
                <input className="input" placeholder="e.g., Three-vessel coronary artery disease with angina despite medication" value={order.reason} onChange={(e) => setOrder({ ...order, reason: e.target.value })} />
              </div>
            </div>
            <button className="btn-primary mt-5 w-full sm:w-auto" disabled={!canRun} onClick={run}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} {busy || "Run Copilot"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card card-pad lg:sticky lg:top-20">
            <h2 className="mb-2">Chart preview</h2>
            {!preview && <p className="text-sm text-slate-400">{tab === "upload" ? "Your note and uploaded reports become the patient's chart." : "Select a patient to preview their documents."}</p>}
            {preview && (
              <div className="max-h-[65vh] space-y-3 overflow-y-auto">
                {preview.documents.map((d) => (
                  <div key={d.id} className="rounded-lg border border-slate-200">
                    <div className="border-b border-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                      {d.title} <span className="text-slate-400">· {d.date}</span>
                    </div>
                    <pre className="whitespace-pre-wrap px-3 py-2 font-sans text-xs leading-relaxed text-slate-600">{d.text}</pre>
                  </div>
                ))}
              </div>
            )}
            {files.length > 0 && <p className="mt-3 text-xs text-slate-500">+ {files.length} file(s) to be read by the Report Reader when the copilot starts.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

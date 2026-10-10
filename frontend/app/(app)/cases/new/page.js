"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, FileText, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader, ErrorBox, Loading } from "@/components/ui";

export default function NewCase() {
  const router = useRouter();
  const { meta, user } = useAuth();
  const [patients, setPatients] = useState(null);
  const [tab, setTab] = useState("sample");
  const [patientId, setPatientId] = useState("");
  const [preview, setPreview] = useState(null);
  const [order, setOrder] = useState({ cpt: "73721", reason: "", urgency: "routine", payer: "" });
  const [upload, setUpload] = useState({ name: "", dob: "", sex: "F", payer: "Medicare", memberId: "", noteTitle: "Clinical note", noteText: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/patients").then(setPatients).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!patientId) return setPreview(null);
    const p = patients?.find((x) => x.id === patientId);
    if (p) setOrder((o) => ({ ...o, payer: p.payer, ...(p.defaultOrder ? { cpt: p.defaultOrder.cpt, reason: p.defaultOrder.reason } : {}) }));
    api.get(`/patients/${patientId}`).then(setPreview);
  }, [patientId, patients]);

  if (user.role === "manager") return <ErrorBox error="Managers cannot create cases. Switch to the coordinator or physician account." />;
  if (!patients) return <Loading />;

  async function run() {
    setBusy(true);
    setError("");
    try {
      let pid = patientId;
      if (tab === "upload") {
        const p = await api.post("/patients", upload);
        pid = p.id;
      }
      if (!pid) throw new Error("Select a patient");
      const c = await api.post("/cases", { patientId: pid, ...order, reason: order.reason || undefined, payer: (tab === "upload" ? upload.payer : order.payer) || undefined });
      router.push(`/cases/${c.id}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const setU = (k) => (e) => setUpload((u) => ({ ...u, [k]: e.target.value }));

  return (
    <div>
      <PageHeader title="New prior authorization case" subtitle="Pick a synthetic patient (or upload notes), enter the order, and run the copilot." />
      <ErrorBox error={error} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="card card-pad">
            <div className="mb-4 flex gap-2">
              <button className={tab === "sample" ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setTab("sample")}>
                <FileText size={14} /> Sample patient
              </button>
              <button className={tab === "upload" ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setTab("upload")}>
                <Upload size={14} /> Upload notes
              </button>
            </div>
            {tab === "sample" ? (
              <div className="space-y-2">
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
                  <label className="label">Payer</label>
                  <select className="input" value={upload.payer} onChange={setU("payer")}>
                    {meta.payers.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Clinical note (.txt or paste)</label>
                  <input
                    type="file"
                    accept=".txt,.md,text/plain"
                    className="mb-2 block w-full text-xs text-slate-500"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const text = await f.text();
                      setUpload((u) => ({ ...u, noteTitle: f.name, noteText: text }));
                    }}
                  />
                  <textarea className="input min-h-[200px] font-mono text-xs" placeholder="Paste the visit note, PT notes, imaging reports…" value={upload.noteText} onChange={setU("noteText")} />
                </div>
              </div>
            )}
          </div>

          <div className="card card-pad">
            <h2 className="mb-3">Order</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="label">Procedure</label>
                <select className="input" value={order.cpt} onChange={(e) => setOrder({ ...order, cpt: e.target.value })}>
                  {meta.procedures.map((p) => (
                    <option key={p.cpt} value={p.cpt}>
                      {p.cpt}: {p.name}
                    </option>
                  ))}
                </select>
              </div>
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
                <label className="label">Urgency</label>
                <select className="input" value={order.urgency} onChange={(e) => setOrder({ ...order, urgency: e.target.value })}>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="label">Clinical reason</label>
                <input className="input" placeholder="e.g., Suspected medial meniscal tear, right knee" value={order.reason} onChange={(e) => setOrder({ ...order, reason: e.target.value })} />
              </div>
            </div>
            <button className="btn-primary mt-5 w-full sm:w-auto" disabled={busy || (tab === "sample" ? !patientId : !upload.name || !upload.noteText)} onClick={run}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Run Copilot
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card card-pad lg:sticky lg:top-20">
            <h2 className="mb-2">Chart preview</h2>
            {!preview && <p className="text-sm text-slate-400">{tab === "upload" ? "Your uploaded note becomes the patient's chart." : "Select a patient to preview their documents."}</p>}
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
          </div>
        </div>
      </div>
    </div>
  );
}

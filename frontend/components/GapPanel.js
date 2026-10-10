"use client";
import { useState } from "react";
import { AlertTriangle, Paperclip, StickyNote, Ban, MinusCircle, Loader2, CheckCircle2, FileSearch } from "lucide-react";
import { api, uploadFiles } from "@/lib/api";
import ReportUploader from "./ReportUploader";

function GapCard({ caseId, patientId, gap, pendingDocuments, canAct, onDone }) {
  const [mode, setMode] = useState(null);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action, body = {}) {
    setBusy(true);
    setError("");
    try {
      await api.post(`/cases/${caseId}/gaps/${gap.id}/resolve`, { action, ...body });
      onDone?.();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  async function submitFiles() {
    setBusy(true);
    setError("");
    try {
      const docs = await uploadFiles(patientId, files);
      await api.post(`/cases/${caseId}/gaps/${gap.id}/resolve`, { action: "attach_document", documentIds: docs.map((d) => d.id) });
      onDone?.();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setTitle(f.name.replace(/\.[^.]+$/, ""));
    setText(await f.text());
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-mono text-slate-500">{gap.criterionId || "Request"}</span>
            {gap.wouldBeDenied && <span className="chip bg-red-100 px-1.5 py-0 text-[10px] text-red-700">would be denied</span>}
            <span className="text-slate-500">→ {gap.assignedRole}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-900">{gap.question}</p>
          {gap.detail && <p className="mt-0.5 text-xs text-slate-600">{gap.detail}</p>}
        </div>
      </div>

      {!canAct && <p className="mt-2 text-xs text-slate-500">Sign in as the physician or coordinator to answer.</p>}

      {canAct && (
        <>
          {pendingDocuments?.length > 0 && gap.actions.includes("attach_document") && gap.criterionId && (
            <div className="mt-3 rounded-md border border-sky-200 bg-white p-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-sky-700">
                <FileSearch size={14} /> Found in outside records (health information exchange, demo)
              </div>
              {pendingDocuments.map((d) => (
                <div key={d.id} className="mt-1.5 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-700">
                    {d.title} <span className="text-slate-400">({d.date})</span>
                  </span>
                  <button disabled={busy} onClick={() => act("attach_document", { documentId: d.id })} className="btn-primary btn-sm shrink-0">
                    Attach
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {gap.actions.includes("attach_document") && (
              <button className="btn-secondary btn-sm" onClick={() => setMode(mode === "doc" ? null : "doc")}>
                <Paperclip size={13} /> Attach document
              </button>
            )}
            {gap.actions.includes("add_note") && (
              <button className="btn-secondary btn-sm" onClick={() => setMode(mode === "note" ? null : "note")}>
                <StickyNote size={13} /> Add note
              </button>
            )}
            {gap.actions.includes("mark_not_applicable") && (
              <button className="btn-secondary btn-sm" disabled={busy} onClick={() => act("mark_not_applicable")}>
                <MinusCircle size={13} /> {gap.actionLabels?.mark_not_applicable || "Not applicable"}
              </button>
            )}
            {gap.actions.includes("confirm_not_done") && (
              <button className="btn-secondary btn-sm" disabled={busy} onClick={() => act("confirm_not_done")}>
                <Ban size={13} /> {gap.actionLabels?.confirm_not_done || "Confirm not done"}
              </button>
            )}
          </div>

          {mode && (
            <div className="mt-3 space-y-2">
              {mode === "doc" && (
                <>
                  <ReportUploader files={files} onChange={setFiles} compact />
                  {files.length > 0 && (
                    <button className="btn-primary btn-sm" disabled={busy} onClick={submitFiles}>
                      {busy && <Loader2 size={13} className="animate-spin" />} Upload {files.length} file(s) & re-run copilot
                    </button>
                  )}
                  <p className="text-xs text-slate-500">Or paste the text of the record:</p>
                  <input className="input" placeholder="Document title (e.g., PT discharge summary)" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <input type="file" accept=".txt,.md,text/plain" onChange={onFile} className="block w-full text-xs text-slate-500" />
                </>
              )}
              <textarea
                className="input min-h-[96px]"
                placeholder={mode === "doc" ? "Paste the document text (or choose a .txt file)…" : "e.g., Patient completed 8 weeks of physical therapy (06/01 to 07/27) with minimal relief."}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="btn-primary btn-sm" disabled={busy || !text.trim()} onClick={() => act(mode === "doc" ? "attach_document" : "add_note", { title, text })}>
                {busy && <Loader2 size={13} className="animate-spin" />} Submit & re-run copilot
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </>
      )}
    </div>
  );
}

export default function GapPanel({ caseData, user, onChange }) {
  const open = caseData.gaps.filter((g) => g.status === "OPEN");
  const resolved = caseData.gaps.filter((g) => g.status === "RESOLVED");
  const canAct = ["physician", "coordinator"].includes(user?.role);
  const [skipping, setSkipping] = useState(false);

  if (!open.length && !resolved.length) return null;
  return (
    <div className="space-y-3">
      {open.map((g) => (
        <GapCard key={g.id} caseId={caseData.id} patientId={caseData.patientId} gap={g} pendingDocuments={caseData.pendingDocuments} canAct={canAct} onDone={onChange} />
      ))}
      {open.length > 0 && user?.role === "coordinator" && (
        <button
          className="text-xs text-slate-500 underline hover:text-slate-700"
          disabled={skipping}
          onClick={async () => {
            setSkipping(true);
            await api.post(`/cases/${caseData.id}/gaps/skip`);
            onChange?.();
          }}
        >
          Proceed without this evidence (high denial risk)
        </button>
      )}
      {resolved.length > 0 && (
        <div className="space-y-1.5">
          {resolved.map((g) => (
            <div key={g.id} className="flex items-start gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>
                <span className="font-mono">{g.criterionId || "Request"}</span>: {g.resolution?.summary} <span className="text-slate-400">({g.resolution?.by})</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

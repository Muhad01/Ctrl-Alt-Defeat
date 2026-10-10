"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Gavel, CheckCircle2, XCircle, AlertTriangle, PhoneCall, Pencil, Save, Send, Loader2, FileWarning } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCase } from "@/components/useCase";
import { StatusChip, Loading, ErrorBox, MarkdownLetter, ModeTag } from "@/components/ui";

export default function AppealPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: c, error, setError, reload } = useCase(id);
  const [letterText, setLetterText] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (c?.appeal && !editing) setDraft(c.appeal.letter);
  }, [c?.appeal, editing]);

  if (error && !c) return <ErrorBox error={error} />;
  if (!c) return <Loading />;
  const isCoordinator = user.role === "coordinator";

  async function act(name, fn) {
    setBusy(name);
    setError("");
    try {
      await fn();
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <Link href={`/cases/${c.id}`} className="mb-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
        <ArrowLeft size={13} /> Back to workspace
      </Link>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <h1>Denial & appeal</h1>
        <span className="font-mono text-sm text-slate-500">{c.id}</span>
        <StatusChip status={c.status} />
      </div>
      <ErrorBox error={error} />

      {!c.denial && (
        <div className="card card-pad max-w-2xl">
          <h2 className="mb-1 flex items-center gap-2">
            <FileWarning size={18} /> Record a denial
          </h2>
          <p className="mb-3 text-sm text-slate-500">Paste the payer&apos;s denial letter. The appeal agent will classify the reason, search the chart for counter-evidence and draft the appeal.</p>
          <textarea className="input min-h-[180px]" value={letterText} onChange={(e) => setLetterText(e.target.value)} placeholder="NOTICE OF ADVERSE DETERMINATION…" />
          <button className="btn-primary mt-3" disabled={!letterText.trim() || !isCoordinator || !!busy || !c.policy} onClick={() => act("deny", () => api.post(`/cases/${c.id}/denial`, { letterText }))}>
            {busy === "deny" && <Loader2 size={15} className="animate-spin" />} Record denial & draft appeal
          </button>
          {!isCoordinator && <p className="mt-2 text-xs text-slate-500">Only the PA coordinator can record denials.</p>}
        </div>
      )}

      {c.denial && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-5">
            <div className="card card-pad">
              <h2 className="mb-2 flex items-center gap-2 text-red-700">
                <Gavel size={18} /> Payer determination
              </h2>
              <pre className="whitespace-pre-wrap rounded-lg bg-red-50 p-3 font-sans text-xs leading-relaxed text-slate-700">{c.denial.letterText}</pre>
            </div>

            {c.appeal && (
              <>
                <div className="card card-pad">
                  <div className="mb-2 flex items-center justify-between">
                    <h2>Denial analysis</h2>
                    <ModeTag mode={c.appeal.mode} />
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="chip bg-red-100 text-red-800">{c.appeal.reasonLabel}</span>
                    <span className="text-xs text-slate-500">{Math.round(c.appeal.classificationConfidence * 100)}% confidence</span>
                  </div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Counter-evidence in the current chart</div>
                  <div className="space-y-2">
                    {c.appeal.counterEvidence.map((ce) => (
                      <div key={ce.criterionId} className="rounded-lg border border-slate-200 p-2.5">
                        <div className="flex items-start gap-2">
                          {ce.status === "MET" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" /> : ce.status === "UNCLEAR" ? <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" /> : <XCircle size={16} className="mt-0.5 shrink-0 text-red-600" />}
                          <div>
                            <div className="text-sm font-medium text-slate-800">
                              <span className="font-mono text-xs text-slate-500">§{ce.ref}</span> {ce.text}
                            </div>
                            <div className="text-xs text-slate-500">{ce.reasoning}</div>
                            {ce.evidence?.[0] && (
                              <div className="mt-1 text-xs italic text-slate-600">
                                &ldquo;{ce.evidence[0].quote}&rdquo; <span className="not-italic text-slate-400">({ce.evidence[0].docTitle})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Appeal strength: <span className="font-semibold text-slate-800">{Math.round(c.appeal.strength * 100)}%</span> of disputed criteria now supported by verified evidence.
                  </div>
                </div>

                <div className={`card card-pad ${c.appeal.p2p.recommended ? "border-amber-300" : ""}`}>
                  <h2 className="mb-1 flex items-center gap-2">
                    <PhoneCall size={16} /> Peer-to-peer: {c.appeal.p2p.recommended ? "recommended" : "not needed"}
                  </h2>
                  <p className="text-sm text-slate-600">{c.appeal.p2p.reason}</p>
                  {c.appeal.p2p.talkingPoints.length > 0 && (
                    <>
                      <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Talking points for the physician</div>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {c.appeal.p2p.talkingPoints.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
              <h2>Appeal letter</h2>
              {c.appeal && c.status === "APPEAL_DRAFTED" && (
                <div className="flex gap-2">
                  {editing ? (
                    <button className="btn-primary btn-sm" onClick={() => act("save", async () => (await api.put(`/cases/${c.id}/appeal`, { letter: draft }), setEditing(false)))}>
                      <Save size={13} /> Save
                    </button>
                  ) : (
                    <button className="btn-secondary btn-sm" onClick={() => setEditing(true)}>
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="p-5">
              {!c.appeal ? (
                <div className="text-sm text-slate-500">
                  No appeal drafted yet.
                  {isCoordinator && (
                    <button className="btn-primary btn-sm ml-2" disabled={!!busy} onClick={() => act("draft", () => api.post(`/cases/${c.id}/appeal/draft`))}>
                      Draft appeal
                    </button>
                  )}
                </div>
              ) : editing ? (
                <textarea className="input min-h-[480px] font-mono text-xs" value={draft} onChange={(e) => setDraft(e.target.value)} />
              ) : (
                <MarkdownLetter text={c.appeal.letter} citations={c.appeal.citations} />
              )}
              {c.appeal && (
                <div className="mt-6 border-t border-slate-100 pt-4">
                  {c.status === "APPEAL_DRAFTED" &&
                    (isCoordinator ? (
                      <button className="btn-success" disabled={!!busy || editing} onClick={() => act("submit", () => api.post(`/cases/${c.id}/appeal/submit`))}>
                        {busy === "submit" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Approve & submit appeal
                      </button>
                    ) : (
                      <p className="text-sm text-slate-500">Waiting for the PA coordinator to submit the appeal.</p>
                    ))}
                  {c.status === "APPEAL_SUBMITTED" && (
                    <p className="flex items-center gap-2 text-sm text-sky-700">
                      <Loader2 size={15} className="animate-spin" /> Appeal submitted. Awaiting payer decision…
                    </p>
                  )}
                  {["OVERTURNED", "UPHELD"].includes(c.status) && (
                    <div className={`rounded-lg px-3 py-2 text-sm ${c.status === "OVERTURNED" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                      <strong>Appeal {c.status.toLowerCase()}.</strong> {c.appeal.decisionReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

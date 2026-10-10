"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, Eye, Save, Send, MessageSquareWarning, Ban, Swords, Loader2, Quote, X, ClipboardList, Download, FlaskConical } from "lucide-react";
import { api, API_URL, getToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCase } from "@/components/useCase";
import { StatusChip, Loading, ErrorBox, MarkdownLetter, MockBadge } from "@/components/ui";
import { ReadinessGauge, ReadinessFixes, Contributions, VerifierChecklist, Courtroom } from "@/components/Insights";
import { pct } from "@/lib/format";

export default function PacketReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: c, error, setError, reload } = useCase(id);
  const [tab, setTab] = useState("letter");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [cite, setCite] = useState(null);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    if (c?.packet && !editing) setDraft(c.packet.letter);
  }, [c?.packet, editing]);

  if (error && !c) return <ErrorBox error={error} />;
  if (!c) return <Loading />;
  if (!c.packet) return <ErrorBox error="The packet has not been drafted yet. Resolve open gaps in the workspace first." />;

  const isCoordinator = user.role === "coordinator";
  const canEdit = ["coordinator", "physician"].includes(user.role) && ["READY_FOR_REVIEW", "NEEDS_INFO"].includes(c.status);
  const reviewable = c.status === "READY_FOR_REVIEW";

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

  const approve = () =>
    act("approve", async () => {
      const ack = c.verifier?.status === "FAIL";
      if (ack && !window.confirm("The verifier reported high-severity issues. Approve and submit anyway?")) return;
      await api.post(`/cases/${c.id}/approve`, { acknowledgeWarnings: ack });
    });

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={`/cases/${c.id}`} className="mb-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
            <ArrowLeft size={13} /> Back to workspace
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1>Packet review</h1>
            <span className="font-mono text-sm text-slate-500">{c.id}</span>
            <StatusChip status={c.status} />
            <span className="text-xs text-slate-400">
              v{c.packet.version}
              {c.packet.editedBy ? `, edited by ${c.packet.editedBy}` : ""}
            </span>
            <MockBadge>SYNTHETIC DATA</MockBadge>
          </div>
        </div>
        <a className="btn-secondary" href={`${API_URL}/api/cases/${c.id}/packet.pdf?token=${encodeURIComponent(getToken() || "")}`}>
          <Download size={15} /> Download PDF
        </a>
      </div>
      <ErrorBox error={error} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
              <div className="flex gap-1">
                {[
                  ["letter", "Letter of Medical Necessity"],
                  ["form", "Auth form"],
                  ["citations", `Citations (${c.packet.citations.length})`],
                ].map(([k, label]) => (
                  <button key={k} onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === k ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}>
                    {label}
                  </button>
                ))}
              </div>
              {tab === "letter" && canEdit && (
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button className="btn-secondary btn-sm" onClick={() => setEditing(false)}>
                        <Eye size={13} /> Cancel
                      </button>
                      <button
                        className="btn-primary btn-sm"
                        disabled={busy === "save"}
                        onClick={() =>
                          act("save", async () => {
                            await api.put(`/cases/${c.id}/packet`, { letter: draft });
                            setEditing(false);
                          })
                        }
                      >
                        {busy === "save" ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save & re-verify
                      </button>
                    </>
                  ) : (
                    <button className="btn-secondary btn-sm" onClick={() => setEditing(true)}>
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-5">
              {tab === "letter" &&
                (editing ? (
                  <div>
                    <textarea className="input min-h-[560px] font-mono text-xs leading-relaxed" value={draft} onChange={(e) => setDraft(e.target.value)} />
                    <p className="mt-2 text-xs text-slate-500">Keep citation markers like [3] next to clinical statements. The verifier flags any uncited clinical claim when you save.</p>
                  </div>
                ) : (
                  <MarkdownLetter text={c.packet.letter} citations={c.packet.citations} onCite={setCite} />
                ))}

              {tab === "form" && (
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {Object.entries(c.packet.form).map(([k, v]) => (
                    <div key={k}>
                      <dt className="label">{k.replace(/([A-Z])/g, " $1")}</dt>
                      <dd className="text-sm text-slate-800">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {tab === "citations" && (
                <ol className="space-y-2">
                  {c.packet.citations.map((ct) => (
                    <li key={ct.n} className="flex gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-brand-100 text-xs font-semibold text-brand-700">{ct.n}</span>
                      <div>
                        <p className="italic text-slate-700">&ldquo;{ct.quote}&rdquo;</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {ct.docTitle} · characters {ct.start} to {ct.end} · verified verbatim
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="card card-pad">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2">
                <Swords size={18} className="text-red-600" /> Insurer Simulator
              </h2>
              <button className="btn-secondary btn-sm" disabled={busy === "sim"} onClick={() => act("sim", () => api.post(`/cases/${c.id}/adversarial-review`))}>
                {busy === "sim" && <Loader2 size={13} className="animate-spin" />} Re-run review
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              A simulated {c.coding.payer} reviewer tries to deny this packet using only the payer policy. Objections without a real policy citation are discarded automatically; rebuttals may only use verified chart quotes.
            </p>
            <Courtroom adversarial={c.adversarial} />
          </div>
        </div>

        <aside className="space-y-5">
          {cite && (
            <div className="card card-pad border-brand-300 ring-2 ring-brand-100">
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-semibold text-brand-700">
                  <Quote size={13} /> Citation [{cite.n}]
                </span>
                <button onClick={() => setCite(null)} className="text-slate-400 hover:text-slate-600" aria-label="Close">
                  <X size={14} />
                </button>
              </div>
              <p className="text-sm italic text-slate-700">&ldquo;{cite.quote}&rdquo;</p>
              <p className="mt-1 text-xs text-slate-400">{cite.docTitle}</p>
            </div>
          )}

          <div className="card card-pad">
            <ReadinessGauge readiness={c.readiness} history={c.predictionHistory} />
            <div className="mt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">What to fix</h3>
              <ReadinessFixes readiness={c.readiness} />
            </div>
            {c.readiness && <p className="mt-3 text-[11px] leading-snug text-slate-400">Transparent checklist score, not an approval probability: {c.readiness.formula}.</p>}
            {c.prediction && (
              <details className="mt-4 rounded-lg border border-dashed border-slate-300 p-2.5">
                <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500">
                  <FlaskConical size={13} /> Experimental: ML denial estimate {pct(c.prediction.probability)}
                </summary>
                <p className="my-2 text-[11px] text-slate-500">Logistic regression trained on synthetic outcomes. Not used for decisions; it becomes meaningful once real approval/denial history exists.</p>
                <Contributions prediction={c.prediction} />
              </details>
            )}
          </div>

          <div className="card card-pad">
            <h2 className="mb-3 flex items-center gap-2">
              <ClipboardList size={16} /> Verifier
            </h2>
            <VerifierChecklist verifier={c.verifier} />
          </div>

          <div className="card card-pad lg:sticky lg:top-20">
            <h2 className="mb-1">Decision</h2>
            {reviewable ? (
              isCoordinator ? (
                <div className="space-y-2">
                  <p className="mb-2 text-xs text-slate-500">Nothing is sent to the payer until you approve. Your decision is logged in the audit trail.</p>
                  <button className="btn-success w-full" disabled={!!busy} onClick={approve}>
                    {busy === "approve" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Approve & submit
                  </button>
                  <div className="flex gap-2">
                    <input className="input" placeholder="Note to physician…" value={note} onChange={(e) => setNote(e.target.value)} />
                    <button className="btn-secondary shrink-0" disabled={!note.trim() || !!busy} onClick={() => act("changes", () => api.post(`/cases/${c.id}/request-changes`, { note }))}>
                      <MessageSquareWarning size={15} />
                    </button>
                  </div>
                  {showReject ? (
                    <button className="btn-danger w-full" onClick={() => act("reject", () => api.post(`/cases/${c.id}/reject`, { reason: note || "Rejected by coordinator" }))}>
                      Confirm reject
                    </button>
                  ) : (
                    <button className="btn-danger w-full" onClick={() => setShowReject(true)}>
                      <Ban size={15} /> Reject
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Waiting for the PA coordinator to approve.</p>
              )
            ) : (
              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  Status: <StatusChip status={c.status} />
                </p>
                {c.approval && <p className="text-xs">Approved by {c.approval.by}</p>}
                {c.submission?.payerReference && <p className="text-xs">Payer reference {c.submission.payerReference}</p>}
                {c.submission?.decisionReason && <p className="text-xs">{c.submission.decisionReason}</p>}
                {c.status === "SUBMITTED" && (
                  <p className="flex items-center gap-1.5 text-xs text-sky-700">
                    <Loader2 size={13} className="animate-spin" /> Awaiting payer determination…
                  </p>
                )}
                {c.denial && (
                  <Link href={`/cases/${c.id}/appeal`} className="btn-danger w-full">
                    Open denial & appeal
                  </Link>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

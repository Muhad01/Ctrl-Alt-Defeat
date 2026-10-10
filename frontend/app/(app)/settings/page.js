"use client";
import { useState } from "react";
import { Sparkles, Cpu, RotateCcw, Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/format";
import { PageHeader, ErrorBox } from "@/components/ui";

const SAFEGUARDS = [
  ["Evidence or it did not happen", "Every extracted fact, criterion verdict and letter citation must be an exact substring of a chart document. Code rejects anything else."],
  ["Independent verifier", "Programmatic audit of citations, criteria coverage, codes and patient identity, plus a separate model audit when an LLM is enabled."],
  ["Adversarial review guardrails", "Simulated payer objections must cite a real policy section; rebuttals may only use verified quotes or open a gap for a human."],
  ["Human in the loop", "The workflow pauses for clinician input on gaps and for coordinator approval before anything is submitted."],
  ["Append-only audit log", "Every agent output and human decision is recorded with actor and timestamp."],
  ["PHI minimisation", "Synthetic data only; patient names are masked in list views. A real deployment would add de-identification before LLM calls and a BAA."],
];

export default function Settings() {
  const { user, meta } = useAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function reset() {
    if (!window.confirm("Reset all demo data? This deletes every case and restores the seeded demo state.")) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/admin/reset");
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="AI configuration, safeguards and demo controls." />
      <ErrorBox error={error} />
      <div className="card card-pad mb-5">
        <h2 className="mb-2 flex items-center gap-2">{meta.ai.mode === "llm" ? <Sparkles size={18} className="text-violet-600" /> : <Cpu size={18} />} AI engine</h2>
        {meta.ai.mode === "llm" ? (
          <p className="text-sm text-slate-600">
            Agents use {meta.ai.providerLabel} <span className="font-mono">{meta.ai.model}</span> with structured JSON outputs. Every output is validated in code; if a call fails, the agent falls back to its rule engine and the timeline says so.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            Agents are running on the deterministic rule engine. Set <span className="font-mono">MISTRAL_API_KEY</span> (or <span className="font-mono">ANTHROPIC_API_KEY</span>) in <span className="font-mono">backend/.env</span> and restart the API to switch the intake, matcher, writer, verifier, insurer simulator and appeal agents to the LLM.
          </p>
        )}
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Storage: </span>
          {meta.storage?.type === "mongodb" ? (
            <>
              MongoDB <span className="font-mono text-xs">{meta.storage.host}</span>, database <span className="font-mono text-xs">{meta.storage.database}</span>
            </>
          ) : (
            <>
              local JSON file. Set <span className="font-mono text-xs">MONGODB_URI</span> in <span className="font-mono text-xs">backend/.env</span> to use MongoDB Atlas.
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Signed in as {user.name} ({ROLE_LABEL[user.role]}).
        </p>
      </div>

      <div className="card card-pad mb-5">
        <h2 className="mb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" /> Safety & compliance controls
        </h2>
        <ul className="space-y-3">
          {SAFEGUARDS.map(([t, d]) => (
            <li key={t}>
              <div className="text-sm font-medium text-slate-800">{t}</div>
              <div className="text-sm text-slate-600">{d}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card card-pad">
        <h2 className="mb-1">Demo data</h2>
        <p className="mb-3 text-sm text-slate-600">Restore the seeded patients, policies, history and four example cases (approved, denied with appeal drafted, needs info, ready for review).</p>
        {user.role === "manager" ? (
          <button className="btn-danger" onClick={reset} disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />} Reset demo data
          </button>
        ) : (
          <p className="text-xs text-slate-500">Sign in as the manager (sara@demo.health) to reset.</p>
        )}
        {done && <p className="mt-2 text-sm text-emerald-700">Demo data restored.</p>}
      </div>
    </div>
  );
}

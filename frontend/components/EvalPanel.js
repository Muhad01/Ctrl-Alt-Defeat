"use client";
import { useEffect, useState } from "react";
import { FlaskConical, Loader2, CheckCircle2, XCircle, Play } from "lucide-react";
import { api } from "@/lib/api";
import { pct, fmtDateTime } from "@/lib/format";

/** 6 hand-labeled evaluation cases: criteria accuracy, grounding rate, gap recall, insurer effect. */
export default function EvalPanel({ canRun, llmLabel }) {
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/eval").then(setReport).catch(() => {});
  }, []);

  async function run(engine) {
    setBusy(engine);
    setError("");
    try {
      setReport(await api.post("/eval/run", { engine }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }

  const m = report?.metrics;
  return (
    <div className="card">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <FlaskConical size={18} /> Evaluation: 6 labeled test cases
          </h2>
          <p className="text-xs text-slate-500">Expected verdicts were labeled by hand from the chart text. Run it live to show real numbers.</p>
        </div>
        {canRun && (
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary btn-sm" disabled={!!busy} onClick={() => run("rules")}>
              {busy === "rules" ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Run (rule engine)
            </button>
            {llmLabel && (
              <button className="btn-primary btn-sm" disabled={!!busy} onClick={() => run("current")}>
                {busy === "current" ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Run ({llmLabel})
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="px-5 pt-3 text-sm text-red-600">{error}</p>}
      {!report ? (
        <p className="px-5 py-6 text-sm text-slate-500">No evaluation run yet.{canRun ? " Click Run." : ""}</p>
      ) : (
        <div className="p-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Criteria match accuracy" value={pct(m.criteriaAccuracy, 1)} detail={`${m.criteriaCorrect}/${m.criteriaTotal} criteria`} />
            <Metric label="Evidence grounding rate" value={pct(m.groundingRate, 1)} detail={`${m.verifiedQuotes}/${m.citedQuotes} cited quotes verbatim in chart`} />
            <Metric label="Gap detection recall" value={pct(m.gapRecall, 1)} detail={`${m.caughtGaps}/${m.plantedGaps} planted gaps · ${m.falseGaps} false gaps`} />
            <Metric label="Insurer (RAG) effect" value={m.insurerEffect ? "Yes" : "No"} detail="Same chart fails one insurer, passes the other" />
          </div>
          {m.modelQuotes && (
            <p className="mb-3 text-xs text-slate-500">
              Raw model quotes: {m.modelQuotes.exact} exact, {m.modelQuotes.repaired} repaired to the matching chart sentence, {m.modelQuotes.rejected} rejected (of {m.modelQuotes.returned}).
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="table-base min-w-[720px]">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Scenario</th>
                  <th>Patient / insurer</th>
                  <th>Criteria</th>
                  <th>Readiness</th>
                  <th>Correct</th>
                </tr>
              </thead>
              <tbody>
                {report.cases.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td className="text-xs">{c.label}</td>
                    <td className="text-xs">
                      {c.patient} / {c.payer}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {c.rows.map((r) => (
                          <span key={r.criterionId} title={`expected ${r.expected}, got ${r.actual}`} className={`chip px-1.5 py-0 font-mono text-[10px] ${r.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {r.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {r.criterionId}:{r.actual}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{c.readiness}</td>
                    <td className="font-medium">
                      {c.correct}/{c.rows.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Engine: {report.engine} · ran {fmtDateTime(report.ranAt)} in {(report.durationMs / 1000).toFixed(1)}s. Note: the rule engine was written against these same synthetic charts, so its score is not a held-out result.
          </p>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{detail}</div>
    </div>
  );
}

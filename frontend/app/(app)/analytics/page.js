"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Loader2, Scale, Info } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { pct } from "@/lib/format";
import { PageHeader, Loading, ErrorBox, Kpi } from "@/components/ui";
import { SimpleBar, SimpleLine } from "@/components/charts";
import EvalPanel from "@/components/EvalPanel";

export default function Analytics() {
  const { user, meta } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/analytics").then(setData).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  if (error && !data) return <ErrorBox error={error} />;
  if (!data) return <Loading />;

  const retrain = async () => {
    setBusy(true);
    try {
      await api.post("/analytics/retrain");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Denial reasons, approval trend, predictor quality and payer accountability."
        actions={
          user.role === "manager" && (
            <button className="btn-secondary" onClick={retrain} disabled={busy}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Retrain predictor
            </button>
          )
        }
      />
      <ErrorBox error={error} />
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
        <Info size={14} className="mt-0.5 shrink-0" />
        Historical outcomes are synthetic (generated with realistic denial rules) so the predictor and charts have data. Live case outcomes are added by the learning loop ({data.liveOutcomes} so far).
      </div>

      <div className="mb-6">
        <EvalPanel canRun={["manager", "coordinator"].includes(user.role)} llmLabel={meta?.ai?.mode === "llm" ? meta.ai.providerLabel : null} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Experimental ML AUC" value={data.model.auc} hint={`Synthetic held-out set (${data.model.testedOn} cases). Roadmap model, not used for decisions`} />
        <Kpi label="Turnaround" value={`${data.turnaround.manualMinutes} → ${data.turnaround.copilotMinutes} min`} hint={data.turnaround.note} />
        <Kpi label="Appeals drafted" value={data.appeals.drafted} hint={`${data.appeals.submitted} submitted · ${data.appeals.overturned} overturned`} />
        <Kpi label="Trained on" value={data.model.trainedOn} hint={`Last trained ${new Date(data.model.trainedAt).toLocaleString()}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card card-pad">
          <h2>Top denial reasons</h2>
          <p className="mb-2 text-xs text-slate-500">Count of denied requests by reason</p>
          <SimpleBar data={data.reasons} x="reason" y="count" name="Denials" layout="vertical" height={240} />
        </div>
        <div className="card card-pad">
          <h2>Approval rate by week</h2>
          <p className="mb-2 text-xs text-slate-500">Share of requests approved, last 12 weeks</p>
          <SimpleLine data={data.weeks} x="week" lines={[{ key: "approvalRate", name: "Approval rate" }]} valueFormatter={(v) => pct(v)} domain={[0, 1]} />
        </div>
        <div className="card card-pad">
          <h2>Predictor calibration</h2>
          <p className="mb-2 text-xs text-slate-500">Predicted vs. actual approval rate per probability bin (held-out set). Closer lines = better calibrated.</p>
          <SimpleLine
            data={data.calibration}
            x="bin"
            lines={[
              { key: "predicted", name: "Predicted" },
              { key: "actual", name: "Actual" },
            ]}
            valueFormatter={(v) => pct(v)}
            domain={[0, 1]}
          />
        </div>
        <div className="card card-pad">
          <h2>Model weights</h2>
          <p className="mb-2 text-xs text-slate-500">Logistic-regression coefficients (log-odds of approval)</p>
          <div className="space-y-1.5">
            {Object.entries(data.model.weights)
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .map(([k, w]) => {
                const max = Math.max(...Object.values(data.model.weights).map(Math.abs));
                return (
                  <div key={k} className="grid grid-cols-[150px_1fr_50px] items-center gap-2 text-xs">
                    <span className="truncate text-slate-600">{k.replaceAll("_", " ")}</span>
                    <div className="relative h-3 rounded bg-slate-100">
                      <div className="absolute top-0 h-3 w-px bg-slate-300" style={{ left: "50%" }} />
                      <div className={`absolute top-0 h-3 rounded ${w >= 0 ? "bg-emerald-500" : "bg-red-500"}`} style={w >= 0 ? { left: "50%", width: `${(w / max) * 50}%` } : { right: "50%", width: `${(-w / max) * 50}%` }} />
                    </div>
                    <span className="text-right font-mono text-slate-500">{w.toFixed(2)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="flex items-center gap-2">
            <Scale size={18} /> Payer accountability
          </h2>
          <p className="text-xs text-slate-500">Denials where every required criterion was documented as met but the payer still denied for &ldquo;not medically necessary&rdquo;.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base min-w-[640px]">
            <thead>
              <tr>
                <th>Payer</th>
                <th>Requests</th>
                <th>Denial rate</th>
                <th>Denials despite all criteria met</th>
                <th>Share of denials</th>
                <th>Appeal overturn rate</th>
              </tr>
            </thead>
            <tbody>
              {data.payers.map((p) => (
                <tr key={p.payer}>
                  <td className="font-medium">{p.payer}</td>
                  <td>{p.requests}</td>
                  <td>{pct(p.denialRate)}</td>
                  <td className={p.inappropriateDenials > 5 ? "font-semibold text-red-700" : ""}>{p.inappropriateDenials}</td>
                  <td>{pct(p.inappropriateRate)}</td>
                  <td>{pct(p.appealOverturnRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

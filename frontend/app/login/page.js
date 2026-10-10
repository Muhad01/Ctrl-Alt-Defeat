"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { api, setToken } from "@/lib/api";

const DEMO = [
  { email: "priya@demo.health", name: "Priya Sharma", role: "PA Coordinator", note: "Creates cases, reviews and submits packets, handles appeals" },
  { email: "khan@demo.health", name: "Dr. Imran Khan", role: "Ordering Physician", note: "Answers documentation gap questions" },
  { email: "sara@demo.health", name: "Sara Ahmed", role: "Revenue Cycle Manager", note: "Analytics, audit log, retraining, demo reset" },
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO[0].email);
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e, as) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email: as || email, password: as ? "demo123" : password });
      setToken(res.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message.includes("fetch") ? "Cannot reach the API. Is the backend running on port 4000?" : err.message);
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-white to-brand-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
            <Bot size={20} />
          </span>
          Prior Auth Copilot
        </div>
        <form onSubmit={submit} className="card card-pad space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />} Sign in
          </button>
        </form>

        <div className="mt-6">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">One-click demo accounts (password demo123)</p>
          <div className="space-y-2">
            {DEMO.map((d) => (
              <button key={d.email} onClick={(e) => submit(e, d.email)} disabled={busy} className="card flex w-full items-center justify-between px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {d.name} <span className="font-normal text-slate-500">· {d.role}</span>
                  </div>
                  <div className="text-xs text-slate-500">{d.note}</div>
                </div>
                <span className="text-xs text-brand-600">Sign in →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

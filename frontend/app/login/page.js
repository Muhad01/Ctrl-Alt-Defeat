"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ClipboardList, Stethoscope, ChartColumn } from "lucide-react";
import { api, setToken } from "@/lib/api";
import Logo from "@/components/Logo";

const DEMO = [
  { email: "priya@demo.health", name: "Priya Sharma", role: "PA Coordinator", note: "Creates cases, reviews and submits packets, handles appeals", icon: ClipboardList },
  { email: "khan@demo.health", name: "Dr. Imran Khan", role: "Ordering Physician", note: "Answers documentation gap questions", icon: Stethoscope },
  { email: "sara@demo.health", name: "Sara Ahmed", role: "Revenue Cycle Manager", note: "Analytics, audit log, retraining, demo reset", icon: ChartColumn },
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO[0].email);
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function submit(e, as) {
    e?.preventDefault();
    setBusy(as || email);
    setError("");
    try {
      const res = await api.post("/auth/login", { email: as || email, password: as ? "demo123" : password });
      setToken(res.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message.includes("fetch") ? "Cannot reach the API. Is the backend running on port 4000?" : err.message);
      setBusy("");
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-white">
      <div className="dot-grid fade-mask-b absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(55%_60%_at_50%_0%,rgba(36,101,237,0.10),transparent)]" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-4 py-10">
        <Link href="/" className="mx-auto mb-8" aria-label="Back to home">
          <Logo />
        </Link>
        <div className="text-center">
          <h1 className="text-3xl">Sign in</h1>
          <p className="mt-2 text-sm text-gray-500">Pick a demo account, or use the form. The password is demo123.</p>
        </div>

        <div className="mt-8 space-y-2.5">
          {DEMO.map(({ email: e, name, role, note, icon: Icon }) => (
            <button
              key={e}
              onClick={(ev) => submit(ev, e)}
              disabled={Boolean(busy)}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 text-left shadow-soft transition hover:border-brand-200 hover:shadow-lift active:scale-[0.99] disabled:opacity-60"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gray-50 text-ink ring-1 ring-gray-200 transition group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:ring-brand-100">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink">
                  {name} <span className="font-normal text-gray-500">{role}</span>
                </span>
                <span className="block truncate text-xs text-gray-500">{note}</span>
              </span>
              {busy === e ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <ArrowRight size={16} className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-ink" />}
            </button>
          ))}
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" /> or sign in with email <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={submit} className="frost-glass space-y-4 rounded-xl p-5">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <button className="btn-primary w-full py-2.5" disabled={Boolean(busy)}>
            {busy && busy === email && <Loader2 size={16} className="animate-spin" />} Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">Synthetic patients and mock policies only.</p>
      </div>
    </div>
  );
}

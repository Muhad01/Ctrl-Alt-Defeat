import Link from "next/link";
import { ArrowRight, FileSearch, ListChecks, ShieldCheck, Swords, Gavel, TrendingUp, Stethoscope, Bot } from "lucide-react";

const steps = [
  { icon: FileSearch, title: "Read the chart", text: "Intake agent extracts structured facts, each tied to a verbatim quote." },
  { icon: ListChecks, title: "Match payer criteria", text: "RAG retrieves the policy; each criterion becomes met, missing or unclear with citations." },
  { icon: Stethoscope, title: "Close gaps early", text: "Missing evidence becomes one precise question for the clinician before submission." },
  { icon: Swords, title: "Argue with a simulated insurer", text: "An adversarial reviewer tries to deny the packet; the copilot answers each objection with evidence." },
  { icon: ShieldCheck, title: "Verify, predict, approve", text: "An independent verifier audits every citation, a model scores denial risk, and a human approves." },
  { icon: Gavel, title: "Appeal denials", text: "If a payer still denies, the appeal agent finds counter-evidence and drafts the appeal." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Bot size={18} />
          </span>
          Prior Auth Copilot
        </div>
        <Link href="/login" className="btn-secondary">
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pt-16">
        <span className="chip bg-brand-100 text-brand-700">Agentic AI for healthcare operations</span>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">Catch the denial before it happens.</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          A team of AI agents reads the chart, finds the payer&apos;s requirements, cites the evidence, flags what&apos;s missing, stress-tests the packet against a simulated insurer, and drafts the appeal if a request is denied.
          A human approves every submission.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="btn-primary px-5 py-2.5 text-base">
            Try the demo <ArrowRight size={18} />
          </Link>
          <a href="#how" className="btn-secondary px-5 py-2.5 text-base">
            How it works
          </a>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            ["30–45 min", "staff time per manual prior auth request (industry estimate)"],
            ["Missing paperwork", "is a common denial reason even when the care is necessary"],
            ["Every claim cited", "and every submission approved by a human"],
          ].map(([a, b]) => (
            <div key={a} className="card card-pad">
              <div className="text-2xl font-semibold text-slate-900">{a}</div>
              <div className="mt-1 text-sm text-slate-600">{b}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="card card-pad border-l-4 border-l-emerald-500">
          <h2 className="text-lg">Built for Pakistan&apos;s panel hospitals too</h2>
          <p className="mt-2 text-sm text-slate-600">
            Prior authorization is best documented in the US, but private and corporate health insurers in Pakistan also require pre-approval at panel hospitals for admissions and expensive procedures, and staff do the same chart-to-criteria-to-letter work by hand.
            The demo includes a fictional Pakistani insurer (<span className="font-medium">Indus Health, mock</span>) next to US-style mock payers, so you can see the same chart pass one insurer and fail another.
          </p>
          <p className="mt-2 text-xs text-slate-500">All patients are synthetic and all policies are mock documents written for this demo. Time figures are estimates.</p>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card card-pad">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon size={18} />
                </span>
                <span className="text-xs font-medium text-slate-400">Step {i + 1}</span>
              </div>
              <div className="mt-3 font-semibold text-slate-900">{title}</div>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <div className="card card-pad mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 text-brand-600" size={20} />
            <p className="text-sm text-slate-600">
              Decision support for administrative staff only. It does not diagnose or order care. All patient data in this demo is synthetic.
            </p>
          </div>
          <Link href="/login" className="btn-primary shrink-0">
            Open demo
          </Link>
        </div>
      </section>
    </div>
  );
}

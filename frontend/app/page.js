import Link from "next/link";
import { ArrowRight, Quote, ScanSearch, UserCheck, FileSearch, ListChecks, Stethoscope, Swords, ShieldCheck, Gavel, HeartPulse, Bone, Microscope, ScanLine, PenLine, FileText, Paperclip, Plus } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Reveal from "@/components/landing/Reveal";
import OrderPrompt from "@/components/landing/OrderPrompt";
import InsurerSwitch from "@/components/landing/InsurerSwitch";
import CriteriaChecklist from "@/components/CriteriaChecklist";
import { ReadinessGauge } from "@/components/Insights";
import Logo from "@/components/Logo";
import { DEMO, TIMELINE } from "@/components/landing/demoData";

// Measured on the current build (npm --prefix backend test / run eval). Synthetic data.
const STATS = [
  { value: "30 / 30", label: "criteria verdicts correct on the labeled evaluation set" },
  { value: "100%", label: "of cited quotes found word for word in the chart" },
  { value: "72", label: "payer policies across 9 insurers and 8 procedure families" },
  { value: "93", label: "automated end-to-end checks on every change" },
];

const PIPELINE = [
  { icon: FileSearch, title: "Read the chart and reports", text: "PDFs, scans and phone photos become chart text. Every fact keeps its verbatim source quote." },
  { icon: ListChecks, title: "Match the payer's own rules", text: "The insurer's policy is retrieved, and each criterion is marked met, missing or unclear, with the evidence." },
  { icon: Stethoscope, title: "Close gaps before submission", text: "Missing evidence becomes one precise question for the right clinician, with quick actions to answer it." },
  { icon: Swords, title: "Argue with a simulated insurer", text: "An adversarial reviewer tries to deny the packet. Objections without a real policy section are thrown out." },
  { icon: ShieldCheck, title: "Verify, score, approve", text: "An independent verifier audits every citation. Nothing is submitted until a coordinator approves it." },
  { icon: Gavel, title: "Appeal what still gets denied", text: "The appeal agent classifies the denial, searches for counter-evidence and drafts the letter." },
];

const INSURERS = ["Jubilee Life Royale", "EFU Life Mukammal Sehat", "State Life Sahara", "Adamjee Insurance", "Sehat Card Plus", "Indus Health (mock)", "BlueRiver Health (mock)", "Northstar Insurance (mock)", "Medicare (demo LCD)"];

const FAQ = [
  { q: "Is any of this real patient data?", a: "No. Every patient, chart note and outcome is synthetic. The mock payer policies were written for the demo. Pakistani insurer coverage terms come from each insurer's public brochure, with the source linked in the app." },
  { q: "Does the AI decide whether a request goes out?", a: "No. Agents prepare and check the packet. A coordinator reviews and approves every submission, and every human and agent action is written to an append-only audit log." },
  { q: "What stops the model from inventing evidence?", a: "Code, not trust. Every quote must be found word for word in the chart, unverifiable claims are dropped, a MET verdict without a real quote becomes unclear, and uploads that are not clinical records of this patient are kept out." },
  { q: "Which procedures does it handle?", a: "Imaging, heart surgery, angioplasty, joint replacement, chemotherapy and bariatric surgery have their own criteria. Anything else can be typed by name and is checked against the insurer's general medical-necessity policy." },
  { q: "Which AI models does it use?", a: "Claude, Mistral, Groq or a local Ollama model. Without a key, every agent falls back to a deterministic rule engine, so the demo runs fully offline." },
];

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative -mt-16 overflow-hidden border-b border-gray-100 pt-16">
        <div className="dot-grid fade-mask-b absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(36,101,237,0.10),transparent)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-16 text-center sm:px-6 md:pt-24">
          <Reveal>
            <h1 className="mx-auto max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight text-ink md:text-6xl">Catch the denial before the insurer does</h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-500">AI agents match every payer rule to cited chart evidence and flag what is missing, before you submit.</p>
          </Reveal>
          <Reveal delay={0.16} className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn-primary px-5 py-2.5 text-base">
              Open the demo <ArrowRight size={18} />
            </Link>
            <a href="#how" className="btn-secondary px-5 py-2.5 text-base">
              How it works
            </a>
          </Reveal>
          <Reveal delay={0.24} className="mt-10">
            <OrderPrompt />
          </Reveal>
        </div>

        {/* Product preview: the real checklist and gauge components, rendered with real engine output */}
        <Reveal delay={0.3} y={40} amount={0.01} className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="frost-glass overflow-hidden rounded-2xl p-1.5">
            <div className="rounded-xl border border-gray-200/80 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-ink">Sample case</span>
                  <span className="chip bg-amber-100 text-amber-800">Needs info</span>
                </div>
                <span className="text-xs text-gray-400">Hamza Qureshi, knee MRI, BlueRiver Health</span>
              </div>
              <div className="grid gap-5 p-4 md:grid-cols-[1.35fr_1fr]">
                <div className="min-w-0">
                  <CriteriaChecklist criteria={DEMO.blueriver.criteria.slice(0, 3)} />
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <ReadinessGauge readiness={DEMO.blueriver.readiness} />
                  </div>
                  <ol className="space-y-2.5">
                    {TIMELINE.map((t) => (
                      <li key={t.step} className="flex gap-2.5 text-xs">
                        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>
                          <span className="font-medium text-ink">{t.step}</span> <span className="text-gray-500">{t.message}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Measured numbers */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.value} delay={i * 0.06} className={`px-2 py-10 sm:px-6 ${i % 2 ? "border-l border-gray-100" : ""} ${i > 1 ? "border-t border-gray-100 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
              <div className="text-3xl font-medium tracking-tight text-ink md:text-4xl">{s.value}</div>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.label}</p>
            </Reveal>
          ))}
        </div>
        <p className="mx-auto max-w-6xl px-4 pb-6 text-xs text-gray-400 sm:px-6">Measured on synthetic charts written for the demo. Not a held-out clinical validation.</p>
      </section>

      {/* Evidence: template showcase card (statement left, stacked proof right) */}
      <section className="bg-gray-50/60 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">Every claim cited. Every decision human.</h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-12 grid gap-8 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft md:grid-cols-2 md:p-10">
            <div className="flex flex-col justify-center gap-6">
              <div>
                <Quote size={22} className="text-brand-600" />
                <p className="mt-4 text-xl leading-relaxed text-ink">A chatbot can invent evidence. Here, code rejects any statement it cannot trace to a sentence in the patient&apos;s chart.</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: ScanSearch, title: "Verbatim quotes only", text: "Every fact, criterion and letter sentence must quote the chart exactly. Anything else is dropped." },
                { icon: FileText, title: "Relevance gate on uploads", text: "A slide deck or another patient's report never becomes evidence, however many keywords it contains." },
                { icon: UserCheck, title: "A human approves", text: "Coordinators edit, approve or reject. Every action lands in an append-only audit log." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-ink shadow-soft">
                    <Icon size={17} />
                  </span>
                  <div>
                    <div className="font-medium text-ink">{title}</div>
                    <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pipeline: sticky heading, scrolling steps */}
      <section id="how" className="scroll-mt-16 bg-white py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-[1fr_1.25fr]">
          <div className="md:sticky md:top-28 md:self-start">
            <Reveal>
              <h2 className="text-3xl font-medium tracking-tight md:text-5xl">A team of agents, one packet</h2>
              <p className="mt-5 max-w-md leading-relaxed text-gray-500">Each agent has one job and hands verified output to the next. You watch them work live, step by step.</p>
            </Reveal>
          </div>
          <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-gray-200">
            {PIPELINE.map(({ icon: Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 0.04} className="relative flex gap-5 rounded-xl border border-transparent p-3 transition hover:border-gray-200 hover:bg-gray-50/60">
                <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-ink shadow-soft">
                  <Icon size={19} />
                </span>
                <div className="pt-1">
                  <div className="text-lg font-medium text-ink">{title}</div>
                  <p className="mt-1 leading-relaxed text-gray-500">{text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Interactive: same chart, different insurer */}
      <section id="insurers" className="relative scroll-mt-16 overflow-hidden border-y border-gray-100 bg-gray-50/60 py-24">
        <div className="line-grid fade-mask-b absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-3 text-sm font-medium text-brand-600">Try it</div>
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">Same patient. Different insurer. Different answer.</h2>
            <p className="mx-auto mt-5 max-w-lg leading-relaxed text-gray-500">Rules come from the retrieved policy, not hard-coded logic. Switch the insurer and watch the verdict change.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <InsurerSwitch />
          </Reveal>
        </div>
      </section>

      {/* Procedures: bento, 5 items, 5 cells */}
      <section id="procedures" className="scroll-mt-16 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">Built for any procedure, not just scans</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-6">
            <Reveal className="relative overflow-hidden rounded-2xl bg-ink p-7 text-white md:col-span-4 md:row-span-2">
              <div className="dot-grid absolute inset-0 opacity-20 invert" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-10">
                <HeartPulse size={28} className="text-brand-300" />
                <div>
                  <div className="text-2xl font-medium tracking-tight">Heart surgery and angioplasty</div>
                  <p className="mt-2 max-w-md leading-relaxed text-gray-300">Angiography confirmation, symptoms, failed medical therapy, heart-team risk scores and pre-op tests, checked against each payer&apos;s thresholds.</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-300">
                    {["CABG", "Valve replacement", "TAVR", "Cardiac cath", "PCI with stent"].map((p) => (
                      <span key={p} className="rounded-full border border-white/15 px-2.5 py-1">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.05} className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-brand-50 to-white p-6 md:col-span-2">
              <ScanLine size={22} className="text-brand-600" />
              <div className="mt-6 text-lg font-medium text-ink">Imaging</div>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">Knee and spine MRI, brain MRI, CT, PET-CT and echo.</p>
            </Reveal>
            <Reveal delay={0.1} className="rounded-2xl border border-gray-200/80 bg-white p-6 md:col-span-2">
              <Bone size={22} className="text-ink" />
              <div className="mt-6 text-lg font-medium text-ink">Joint replacement</div>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">Radiographic arthritis, weeks of conservative care, medical clearance.</p>
            </Reveal>
            <Reveal delay={0.05} className="rounded-2xl border border-gray-200/80 bg-gray-50 p-6 md:col-span-3">
              <Microscope size={22} className="text-ink" />
              <div className="mt-6 text-lg font-medium text-ink">Oncology and bariatric surgery</div>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">Pathology, staging and treatment plans. BMI thresholds that differ by insurer, including Asian cut-offs.</p>
            </Reveal>
            <Reveal delay={0.1} className="relative overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white p-6 md:col-span-3">
              <PenLine size={22} className="text-brand-600" />
              <div className="mt-6 text-lg font-medium text-ink">Anything else, typed by name</div>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">Kidney transplant, tonsillectomy, dialysis. Checked against the insurer&apos;s general medical-necessity policy.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Reports: split, text left, real analysis output right */}
      <section className="border-t border-gray-100 bg-gray-50/60 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">Drop in the reports. The reader does the rest.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-gray-500">Lab results, ECGs, echo and angiography reports, discharge summaries. Digital PDFs are read directly; scans and phone photos go through AI vision or offline OCR.</p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-lift">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <Paperclip size={16} /> angiography-photo.png
              </span>
              <span className="text-xs text-gray-400">Image read by AI vision</span>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-ink">Cardiac angiography report</div>
              <ul className="mt-3 space-y-2">
                {["Left main coronary artery stenosis of 70%", "Proximal left anterior descending artery stenosis of 95%", "Right coronary artery stenosis of 85%", "Three-vessel coronary artery disease with significant left main stenosis"].map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-gray-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-label="abnormal" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">Each finding is kept only if its quote exists in the transcribed report.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Insurers: the page's one marquee */}
      <section className="overflow-hidden border-y border-gray-100 bg-white py-10" aria-label="Insurers supported in the demo">
        <div className="fade-mask-x">
          <div className="flex w-max animate-scroll-left gap-3 hover:[animation-play-state:paused]">
            {[...INSURERS, ...INSURERS].map((name, i) => (
              <span key={i} aria-hidden={i >= INSURERS.length} className="whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-medium tracking-tight md:text-5xl">Questions</h2>
          </Reveal>
          <div className="mt-12 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-lg font-medium text-ink">
                  {f.q}
                  <Plus size={18} className="shrink-0 text-gray-400 transition group-open:rotate-45" />
                </summary>
                <p className="border-t border-gray-100 bg-white px-6 py-5 leading-relaxed text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-ink px-6 py-16 text-center md:px-16">
          <div className="dot-grid absolute inset-0 opacity-20 invert" aria-hidden="true" />
          <div className="absolute inset-x-0 -top-24 h-64 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(36,101,237,0.45),transparent)]" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight text-white md:text-5xl">See a packet built from the chart up</h2>
            <p className="mx-auto mt-4 max-w-md text-gray-300">One-click demo accounts for a coordinator, a physician and a revenue-cycle manager.</p>
            <Link href="/login" className="btn mt-8 bg-white px-5 py-2.5 text-base text-ink hover:bg-gray-100">
              Open the demo <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <Logo size="sm" />
          <p className="max-w-xl md:text-right">Decision support for administrative staff. It does not diagnose or order care. All patient data in this demo is synthetic.</p>
        </div>
      </footer>
    </div>
  );
}

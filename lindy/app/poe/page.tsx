"use client"
import SectionTransition from "@/components/section-transition"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import StructuredData from "@/components/structured-data"
import Image from "next/image"
import Link from "next/link" // Added Link import
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqData = [
  {
    question: "How does My Lindy write with expert-level quality?",
    answer: (
      <>
        <p className="mb-2">
          <strong>Why it matters:</strong> Most AI content tools know a little about a lot. Poe flips that. It goes deep
          where it counts.
        </p>
        <p className="font-semibold mt-3 mb-1">What Poe does differently:</p>
        <ul className="list-disc list-outside space-y-1 pl-5 mb-3">
          <li>Understands the intricate nuances of insurance, finance, real estate, and AI.</li>
          <li>
            Writes with the tone of an expert who’s been in the trenches—whether it's underwriting policies, building
            property portfolios, decoding LLM architectures, or breaking down a Roth conversion.
          </li>
          <li>Clarifies complex topics fast, using grounded, plainspoken examples.</li>
        </ul>
        <p className="font-semibold mt-3 mb-1">Example:</p>
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
          “You can use an AI chatbot for client intake. But should you? Depends—on your data handling, your compliance
          layer, and your risk appetite. My Lindy knows the difference.”
        </blockquote>
      </>
    ),
  },
  {
    question: "What makes Poe's writing style so conversational?",
    answer: (
      <>
        <p className="mb-2">
          <strong>Why it matters:</strong> Most expert blogs read like textbooks. Poe makes them feel like a
          conversation with someone smart who gets you.
        </p>
        <p className="font-semibold mt-3 mb-1">What Poe does differently:</p>
        <ul className="list-disc list-outside space-y-1 pl-5 mb-3">
          <li>Uses short, sharp, Germanic words.</li>
          <li>Mixes short bursts with occasional long pulls to keep the rhythm varied.</li>
          <li>Engages readers with antipophora (Q&A) and examples within 1-2 lines of any abstract point.</li>
        </ul>
        <p className="font-semibold mt-3 mb-1">Example:</p>
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
          “What’s cash-on-cash return? Think of it like this: you invest $50K into a rental. It pays you back $5K a
          year. That’s a 10% cash-on-cash return. Simple.”
        </blockquote>
      </>
    ),
  },
  {
    question: "How does Poe approach SEO-friendly content?",
    answer: (
      <>
        <p className="mb-2">
          <strong>Why it matters:</strong> You want to rank, but you also want readers to actually finish what they
          start.
        </p>
        <p className="font-semibold mt-3 mb-1">What Poe does differently:</p>
        <ul className="list-disc list-outside space-y-1 pl-5 mb-3">
          <li>Weaves long-tail keywords naturally into content.</li>
          <li>Uses headings and internal/external links that boost SEO without breaking flow.</li>
          <li>Keeps URLs tight, structure clean, and paragraphs skimmable.</li>
        </ul>
        <p className="font-semibold mt-3 mb-1">Example SEO Targets:</p>
        <ul className="list-disc list-outside space-y-1 pl-5">
          <li>How to invest in AI stocks with low risk</li>
          <li>Best landlord insurance by state</li>
          <li>Using ChatGPT for client onboarding in real estate</li>
        </ul>
      </>
    ),
  },
  {
    question: "Why are Poe's examples so effective?",
    answer: (
      <>
        <p className="mb-2">
          <strong>Why it matters:</strong> Jargon and theory don’t stick. Stories do.
        </p>
        <p className="font-semibold mt-3 mb-1">What Poe does differently:</p>
        <ul className="list-disc list-outside space-y-1 pl-5 mb-3">
          <li>Drops real-life examples in 50–70% of every piece.</li>
          <li>Connects abstract ideas—like amortization schedules or prompt engineering—to real-world scenarios.</li>
          <li>Keeps the reader grounded so they get it and stay interested.</li>
        </ul>
        <p className="font-semibold mt-3 mb-1">Example:</p>
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
          “An agent in Atlanta used AI to automate quote comparisons across five carriers. Saved three hours a day.
          That's not a case study—it's what My Lindy explains with details you can copy.”
        </blockquote>
      </>
    ),
  },
  {
    question: "What makes Poe's writing sound so human?",
    answer: (
      <>
        <p className="mb-2">
          <strong>Why it matters:</strong> Readers can smell AI a mile away—and bounce when it stinks.
        </p>
        <p className="font-semibold mt-3 mb-1">What Poe does differently:</p>
        <ul className="list-disc list-outside space-y-1 pl-5 mb-3">
          <li>Writes with personality, rhythm, and intuition.</li>
          <li>Never overuses keywords or regurgitates obvious filler.</li>
          <li>
            Uses tapering techniques and structured storytelling to lead readers through a flow they barely notice.
          </li>
        </ul>
        <p className="font-semibold mt-3 mb-1">Example (Tapering):</p>
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
          “You lost money. On that stock. On that flip. On that first policy lapse.
          <br />
          But it wasn’t the market. Or luck.
          <br />
          It was the plan—
          <br />
          or the lack of one.”
        </blockquote>
      </>
    ),
  },
  {
    question: "Is Poe's writing scalable and consistent?",
    answer: (
      <>
        <p className="mb-2">
          <strong>Why it matters:</strong> Consistency across 20 articles is hard—unless Poe’s writing them.
        </p>
        <p className="font-semibold mt-3 mb-1">What Poe does differently:</p>
        <ul className="list-disc list-outside space-y-1 pl-5 mb-3">
          <li>Keeps voice, tone, and domain accuracy consistent across long-form content.</li>
          <li>Can generate 1,000–2,500 word posts that feel handcrafted.</li>
          <li>Ties together finance, real estate, insurance, and AI when topics overlap. (They do. Often.)</li>
        </ul>
        <p className="font-semibold mt-3 mb-1">Example:</p>
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
          “A real estate investor using AI to analyze neighborhood-level pricing trends? That touches real estate, data
          science, and financial strategy. My Lindy connects those dots.”
        </blockquote>
      </>
    ),
  },
  {
    question: "Who is Poe ideal for?",
    answer: (
      <>
        <p className="mb-2">
          <strong>Why it matters:</strong> Founders don’t have time to write. Teams can’t always match quality at scale.
        </p>
        <p className="font-semibold mt-3 mb-1">What Poe does differently:</p>
        <ul className="list-disc list-outside space-y-1 pl-5">
          <li>Delivers human-like writing that sounds like your smartest team member.</li>
          <li>
            Handles content calendars, thought leadership, explainer posts, sales-enablement blog series—you name it.
          </li>
          <li>Integrates with brand voice but keeps the edge sharp.</li>
        </ul>
      </>
    ),
  },
  {
    question: "Is Poe included in My Lindy plans?",
    answer: (
      <>
        <p>
          Yes! Poe's powerful content generation capabilities are included with <strong>all My Lindy plans</strong>,
          making advanced, human-like content creation accessible to everyone.
        </p>
        <p className="mt-2">
          For more details on what each plan offers, please visit our{" "}
          <Link href="/pricing" className="text-blue-600 hover:underline dark:text-blue-400">
            pricing page
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    question: "Can My Lindy automatically post Poe-generated content to my websites?",
    answer: (
      <>
        <p>
          Absolutely. My Lindy can be configured to automatically publish content created by Poe directly to your
          designated websites, streamlining your content workflow.
        </p>
        <p className="mt-2">
          To enable automatic posting to your preferred sites, please{" "}
          <Link href="/contact" className="text-blue-600 hover:underline dark:text-blue-400">
            contact us
          </Link>
          , and we'll help you set it up.
        </p>
      </>
    ),
  },
]

export default function PoePage() {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
        <MainNavbar />

        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <SectionTransition className="text-center max-w-3xl mx-auto mb-12">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Content generation</div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-gray-900 dark:text-white">
                Write real. Win search.
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Rank high without sounding like a machine.
              </p>

              <div className="flex justify-center">
                <Image
                  src="/poe-my-lindy-strawberry-antler.svg"
                  alt="My Lindy integration with Poe for content generation"
                  width={320}
                  height={200}
                  className="rounded-lg object-contain w-full max-w-sm h-auto"
                  unoptimized
                />
              </div>
            </SectionTransition>

            {/* FAQ Section Start */}
            <div className="pt-16 mt-16 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-10 text-center text-gray-900 dark:text-white">
                FAQ
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqData.map((item, index) => (
                  <AccordionItem
                    value={`item-${index + 1}`}
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger className="text-lg font-medium hover:no-underline text-left px-6 py-4 text-gray-900 dark:text-white">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-gray-700 bg-white dark:bg-white px-6 pt-4 pb-5">
                      <div className="prose prose-sm max-w-none dark:prose-invert reset-prose-styles">
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            {/* FAQ Section End */}
          </div>
        </section>

        <Footer />
      </div>
      <style jsx global>{`
        .reset-prose-styles h4,
        .reset-prose-styles p,
        .reset-prose-styles ul,
        .reset-prose-styles li,
        .reset-prose-styles blockquote {
          color: inherit !important;
        }
        .prose strong {
          color: inherit;
        }
        .prose a {
          color: black !important;
          text-decoration: underline;
          text-decoration-color: black !important;
        }
        .dark .prose a {
          color: black !important; /* User requested black links even in dark mode */
          text-decoration-color: black !important;
        }
        .prose a:hover {
          /* You might want a hover effect, e.g., slightly different underline or opacity */
          /* For now, keeping it consistent with the non-hover state as per request */
          text-decoration-color: black !important;
        }
      `}</style>
    </>
  )
}

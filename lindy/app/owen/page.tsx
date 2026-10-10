"use client"

import SectionTransition from "@/components/section-transition"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import StructuredData from "@/components/structured-data"
import Image from "next/image"
import Link from "next/link" // Added Link import
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Define FAQ data structure
const faqData = [
  {
    question: "What is Owen?",
    answer: (
      <>
        <p className="mb-4">
          Owen isn’t just automation. He’s an AI-powered teammate who sees what’s on your screen and does the work—just
          like a human would. Only faster. And all day, every day.
        </p>
        <p>
          Powered by Claude Vision, Owen is built to handle real-world web tasks across industries. Whether you&apos;re
          in insurance, e-commerce, logistics, finance, or customer support, Owen helps you reclaim time by taking on
          repetitive web-based work automatically.
        </p>
      </>
    ),
  },
  {
    question: "What can Owen do for me?",
    answer: (
      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-medium mb-2">Visual Web Automation</h4>
          <p className="mb-2">
            Owen doesn’t rely on brittle code or scripts. He sees websites the way a person does—buttons, forms, menus,
            and content—and interacts with them intelligently.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Clicks buttons</li>
            <li>Fills out forms</li>
            <li>Navigates websites</li>
            <li>Downloads files</li>
            <li>Extracts visible data</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-medium mb-2">Smart Workflow Execution</h4>
          <p>
            Owen performs multi-step processes across platforms. If you need to log in, pull data, sort it, and upload
            it somewhere else, he can do that from start to finish.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-medium mb-2">Scheduled Operations</h4>
          <p>
            You can schedule Owen to run tasks hourly, daily, or weekly. He works on your timeline, even when
            you&apos;re offline.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-medium mb-2">Screenshot Analysis</h4>
          <p>
            Owen can read what&apos;s on the screen. He captures snapshots, understands what’s there, and makes
            decisions based on what he sees—not just what’s behind the scenes in code.
          </p>
        </div>
      </div>
    ),
  },
  {
    question: "Why do teams choose Owen?",
    answer: (
      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-medium mb-2">Save Time</h4>
          <p>
            Automate the busywork that normally takes hours—logging into sites, navigating dashboards, copying and
            pasting information.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-medium mb-2">Built for Multiple Industries</h4>
          <p className="mb-2">Owen helps:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>E-commerce teams manage pricing, product listings, and inventory</li>
            <li>Logistics teams track shipments, update carrier sites, and manage bookings</li>
            <li>Finance teams pull reports, reconcile records, and monitor accounts</li>
            <li>Insurance teams track claims, pull policy data, and monitor rate changes</li>
            <li>Customer service teams gather client info, verify accounts, and support faster responses</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-medium mb-2">Runs 24/7</h4>
          <p>Owen doesn’t need breaks. He checks data, runs updates, and keeps operations moving around the clock.</p>
        </div>
        <div>
          <h4 className="text-xl font-medium mb-2">Stays Resilient</h4>
          <p>
            Most automations break when a web page changes. Owen adapts by seeing what’s actually on screen, not just
            relying on code.
          </p>
        </div>
      </div>
    ),
  },
  {
    question: "Is Owen built for teams and ready to scale?",
    answer: (
      <p>
        Owen works well solo or across an entire team. You can share automations, manage access, and scale operations
        company-wide.
      </p>
    ),
  },
  {
    question: "Which plans include Owen?",
    answer: (
      <p>
        Owen is part of our premium offerings (
        <Link href="/pricing" className="text-primary hover:underline">
          Gold and Platinum Plans
        </Link>
        ) to ensure top performance and support for high-demand use cases.
      </p>
    ),
  },
  {
    question: "How can Owen help my team focus?",
    answer: (
      <p>
        He sees. He clicks. He thinks. He acts. Owen turns everyday web tasks into quiet background operations. So your
        team can focus on the work that moves things forward.
      </p>
    ),
  },
]

export default function OwenPage() {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
        <MainNavbar />

        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <SectionTransition className="text-center max-w-3xl mx-auto mb-12">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Owen | Platinum plan</div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-gray-900 dark:text-white">
                <span className="md:block">Daily, weekly, or by the hour—</span>
                <span className="md:block">works when you want him to.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
                Automate tasks with AI that understands buttons, forms, and visual content.
              </p>
              <div className="my-8 flex justify-center">
                <Image
                  src="/owen-ai-vision-agent.svg"
                  alt="Owen AI Vision Agent Illustration"
                  width={700}
                  height={700}
                  className="rounded-lg object-contain w-full max-w-2xl"
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
      {/* Added simple CSS to reset prose styles for FAQ answer content */}
      <style jsx global>{`
      .reset-prose-styles h4 {
        color: inherit !important; 
      }
      .reset-prose-styles p {
        color: inherit !important; 
      }
      .reset-prose-styles ul {
        color: inherit !important; 
      }
      .reset-prose-styles li {
        color: inherit !important; 
      }
      .reset-prose-styles a {
        /* Ensure link color from Tailwind's 'text-primary' is applied */
        /* You might need to adjust this if 'text-primary' is not specific enough */
      }
    `}</style>
    </>
  )
}

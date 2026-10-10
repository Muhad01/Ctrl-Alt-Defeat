"use client"

import SectionTransition from "@/components/section-transition"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import StructuredData from "@/components/structured-data"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ContactModal from "@/components/contact-modal"
import { Button } from "@/components/ui/button"
import BookDemoModal from "@/components/book-demo-modal"

const faqData = [
  {
    question: "What are Custom AI Agents?",
    answer: (
      <>
        <p className="mb-4">
          Custom AI Agents are bespoke artificial intelligence programs designed and built to perform specific, unique
          tasks for your business. Unlike pre-built solutions, they are tailored to your exact workflows, proprietary
          software, and business logic.
        </p>
        <p>
          Think of them as digital employees trained exclusively for your company's operational needs, whether it&apos;s
          for data entry into a unique CRM, managing a specialized logistics process, or handling niche customer support
          inquiries.
        </p>
      </>
    ),
  },
  {
    question: "How central is customization to the My Lindy platform?",
    answer: (
      <>
        <p className="mb-4">
          Customization is at the very heart of the My Lindy platform. We believe that AI is most powerful when it's
          perfectly aligned with your unique business processes, not the other way around.
        </p>
        <p>
          Unlike one-size-fits-all solutions, My Lindy allows you to build and tailor AI agents that understand your
          specific workflows, integrate with your proprietary tools, and communicate in your brand's voice. This deep
          level of customization ensures that your agents aren't just performing tasks, but are operating as
          intelligent, integrated members of your team.
        </p>
      </>
    ),
  },
  {
    question: "How quickly can a Custom AI Agent be built?",
    answer: (
      <>
        <p className="mb-4">
          We understand the need for speed. For many common use cases and integrations, our streamlined process allows
          us to design, build, and deploy a functional Custom AI Agent for you within 48 hours.
        </p>
        <p>
          More complex agents requiring intricate logic or multiple new integrations might take longer, but we always
          aim for rapid delivery. We'll provide a clear timeline after our initial consultation.
        </p>
      </>
    ),
  },
  {
    question: "Can I add my own AI agents to the My Lindy platform?",
    answer: (
      <>
        <p className="mb-4">
          The My Lindy platform is designed to be flexible. While we offer services to build custom agents for you, we
          also provide the tools and infrastructure for technically proficient users or development teams to connect and
          manage their own AI agents.
        </p>
        <p>
          This allows you to leverage My Lindy's Unified Context Protocol (MCP), integration capabilities, and
          management features with agents you've developed independently.
        </p>
      </>
    ),
  },
  {
    question: "What is the process for building a Custom Agent?",
    answer: (
      <div className="space-y-4">
        <p>Our process is collaborative and transparent, ensuring the final agent meets your expectations:</p>
        <ul className="list-decimal list-outside space-y-2 pl-5">
          <li>
            <strong>Consultation & Discovery:</strong> We start by deeply understanding your goals, workflows, and the
            challenges you want to solve.
          </li>
          <li>
            <strong>Solution Design:</strong> Our team architects a plan for your agent, outlining its capabilities,
            integration points, and expected outcomes.
          </li>
          <li>
            <strong>Development & Integration:</strong> We build the agent, connecting it to your required tools and
            platforms, whether through APIs or direct UI interaction.
          </li>
          <li>
            <strong>Testing & Deployment:</strong> You get to see the agent in action. We rigorously test and refine it
            before full deployment into your live environment.
          </li>
          <li>
            <strong>Support & Optimization:</strong> We provide ongoing support to ensure your agent runs smoothly and
            continues to deliver value as your business evolves.
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "How do Custom Agents integrate with my existing tools?",
    answer: (
      <p>
        Custom Agents are designed for maximum compatibility. They can integrate with your existing software stack in
        multiple ways, including via APIs, webhooks, database connections, or even by interacting directly with user
        interfaces, just like a human would. This allows them to work with CRMs, ERPs, internal dashboards, and almost
        any other web-based application.
      </p>
    ),
  },
  {
    question: "How do Custom AI Agents offer deep personalization?",
    answer: (
      <>
        <p className="mb-2">
          Custom agents are tailored to your individual workflows, tone preferences, industry, and knowledge context.
          This enables:
        </p>
        <ul className="list-disc list-outside space-y-1 pl-5">
          <li>Personalized writing styles (e.g., formal, casual, concise).</li>
          <li>Context-aware actions based on your specific business or domain.</li>
          <li>Task automation in your preferred format or systems.</li>
        </ul>
      </>
    ),
  },
  {
    question: "What kind of tasks can Custom AI Agents specialize in?",
    answer: (
      <>
        <p className="mb-2">
          Each custom agent can be trained or configured for a variety of specialized tasks, such as:
        </p>
        <ul className="list-disc list-outside space-y-1 pl-5">
          <li>Email outreach and client follow-ups.</li>
          <li>Summarizing documents and extracting key information.</li>
          <li>Updating CRM records and managing data entry.</li>
          <li>Understanding specific types of documents, forms, or data relevant to your business.</li>
          <li>Automating repetitive workflows like sending reminders or processing submissions.</li>
        </ul>
      </>
    ),
  },
  {
    question: "How do Custom AI Agents lead to faster execution of tasks?",
    answer: (
      <p>
        Once created, custom agents work autonomously on their assigned tasks with minimal user input. This
        significantly reduces the time you would typically spend on manual data entry, switching between different
        software tools, and drafting or reviewing repetitive messages, allowing you and your team to focus on more
        strategic activities.
      </p>
    ),
  },
  {
    question: "What does 'Always-on Expertise' mean for Custom AI Agents?",
    answer: (
      <p>
        Custom agents can be embedded with domain-specific knowledge, such as underwriting rules, policy details, or
        compliance guidelines. They act like a 24/7 digital assistant that consistently applies this expertise, never
        forgets, provides uniform answers, and offers just-in-time support whenever needed.
      </p>
    ),
  },
  {
    question: "What is the Unified Context Protocol (MCP) on the My Lindy platform?",
    answer: (
      <>
        <p className="mb-2">
          My Lindy’s Model Context Protocol (MCP) is a core technology that enhances our Custom AI Agents. It provides
          them with:
        </p>
        <ul className="list-disc list-outside space-y-1 pl-5">
          <li>
            Secure access to your relevant business data, including CRM information, document libraries, communication
            threads, and custom fields.
          </li>
          <li>Persistent memory, allowing them to recall past interactions and context.</li>
          <li>The ability to reason and complete complex, multi-step tasks using real-time business information.</li>
        </ul>
        <p className="mt-2">
          This makes agents on the My Lindy platform significantly more intelligent and situationally aware than
          standard chatbots or isolated automation tools.
        </p>
      </>
    ),
  },
  {
    question: "How do Custom Agents on My Lindy integrate with other business tools?",
    answer: (
      <p>
        Custom agents built on the My Lindy platform are designed for seamless integration. They can sync with popular
        tools like Google Calendar, Gmail, and OpenPhone, connect via third-party APIs, read from and write to your CRM,
        forms, and document systems, and respond to webhook triggers. This capability allows for the creation of
        powerful end-to-end automations across your entire business software stack.
      </p>
    ),
  },
  {
    question: "Can multiple Custom Agents collaborate on the My Lindy platform?",
    answer: (
      <>
        <p className="mb-2">
          Yes, the My Lindy platform supports multi-agent collaboration. You can design agent networks where different
          specialized agents work together to handle various parts of a complex workflow.
        </p>
        <p>
          For instance, one agent could parse inbound form submissions, another could draft and send a personalized
          follow-up message, and a third could update the CRM and notify the relevant sales representative. This
          approach unlocks highly scalable and sophisticated automation across different departments.
        </p>
      </>
    ),
  },
  {
    question: "How does My Lindy support team collaboration and management of Custom Agents?",
    answer: (
      <p>
        The My Lindy platform offers robust features for team environments. Teams can share custom agents with specific
        role-based permissions, track the usage and performance of each agent through analytics, and easily clone or
        adapt existing agents for different team members or evolving use cases. This is particularly beneficial for
        scaling operations in areas like sales, customer support, compliance, and general operations.
      </p>
    ),
  },
  {
    question: "Can you provide examples of how Custom AI Agents are used in different industries?",
    answer: (
      <>
        <p className="mb-2">
          Custom AI Agents are versatile and can be adapted for a wide range of industries. Here are a few examples of
          their applications:
        </p>
        <ul className="list-disc list-outside space-y-1 pl-5">
          <li>
            <strong>Insurance:</strong> Generating policy quotes, checking carrier eligibility, triaging claims.
          </li>
          <li>
            <strong>Financial Services:</strong> Analyzing regulatory documents, profiling clients, scheduling
            follow-ups.
          </li>
          <li>
            <strong>Marketing Teams:</strong> Writing cold emails, triaging form responses, assigning campaign leads.
          </li>
          <li>
            <strong>General SMBs:</strong> Summarizing meetings, assisting with document search, drafting proposals.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "How much does a Custom Agent cost?",
    answer: (
      <>
        <p className="mb-4">
          Pricing for Custom Agents is determined by the project&apos;s scope, complexity, and integration requirements.
          Because each agent is built to solve a unique business challenge, we provide a custom quote after an initial
          consultation.
        </p>
        <ContactModal>
          <Button>Request a Quote</Button>
        </ContactModal>
      </>
    ),
  },
]

export default function CustomPage() {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
        <MainNavbar />

        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <SectionTransition className="text-center max-w-3xl mx-auto mb-12">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Custom AI Solutions</div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-gray-900 dark:text-white">
                AI agents designed <br className="hidden md:block" /> for your business
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Bespoke AI agents for your unique operational needs.
              </p>
              <div className="flex justify-center mb-12">
                <BookDemoModal>
                  <Button size="lg">Book a Demo</Button>
                </BookDemoModal>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/custom-ai-agents-mylindy.svg"
                  alt="Custom AI Agents by MyLindy"
                  width={800}
                  height={500}
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
      <style jsx global>{`
        .reset-prose-styles h4,
        .reset-prose-styles p,
        .reset-prose-styles ul,
        .reset-prose-styles li {
          color: inherit !important;
        }
      `}</style>
    </>
  )
}

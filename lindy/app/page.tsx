"use client"
import Link from "next/link"
import Testimonials from "@/components/testimonials"
import UseCases from "@/components/use-cases"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import TypingPromptInput from "@/components/typing-prompt-input"
import FeaturesSection from "@/components/features-section"
import StructuredData from "@/components/structured-data"
import SectionTransition from "@/components/section-transition"
import StickyProductShowcase from "@/components/sticky-product-showcase"
import CrmShowcaseSection from "@/components/crm-showcase-section"
import IntegrationsGridSimple from "@/components/integrations-grid-simple"
import NewsletterCTA from "@/components/newsletter-cta"
import { Card } from "@/components/ui/card"
import BookDemoModal from "@/components/book-demo-modal"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from "next/image"

const homeFaqData = [
  {
    question: "What is Model Context Protocol (MCP)?",
    answer: (
      <p>
        MCP is a core technology that enables My Lindy to move seamlessly from understanding your questions to
        completing tasks, all without needing you to write code. It allows agents to access CRM data, documents, and
        communication threads, maintaining persistent memory across interactions. This makes our agents highly
        intelligent and situationally aware, saving development time and resources as My Lindy handles complex
        operations automatically.
      </p>
    ),
  },
  {
    question: "How does Action Confirmation provide control?",
    answer: (
      <p>
        My Lindy prompts you for confirmation before executing critical actions like sending emails, scheduling events,
        or making important system updates. This feature ensures you maintain full control, preventing unintended
        actions and giving you the final say.
      </p>
    ),
  },
  {
    question: "What are your pricing plans like? Are there long-term contracts?",
    answer: (
      <p>
        Our pricing plans are designed for flexibility. We offer month-to-month subscriptions, so you're not locked into
        any long-term contracts. You can choose the plan that best suits your current needs and easily scale up or down
        as your business evolves.
      </p>
    ),
  },
  {
    question: "Tell me about the Platinum plan and the AI agent Owen.",
    answer: (
      <>
        <p>
          The Platinum plan is our premium offering, featuring our most advanced AI agent, Owen. Owen is a visual AI
          agent capable of understanding and interacting with web interfaces just like a human would—seeing buttons,
          forms, and content to automate complex tasks directly on your screen.{" "}
          <Link href="/owen" className="text-primary hover:underline font-medium">
            Learn more about Owen and the Platinum plan.
          </Link>
        </p>
      </>
    ),
  },
  {
    question: "What is My Lindy?",
    answer: (
      <p>
        My Lindy is an intelligent automation platform and a smart CRM that deploys AI agents to streamline your
        business operations. It's designed with a personal AI agent that knows your prospects and clients better than
        you do, it's intelligent. We empower businesses to save significant time, reduce manual work, and make smarter,
        data-driven decisions by integrating AI seamlessly into their existing workflows and tools.
      </p>
    ),
  },
  {
    question: "How does My Lindy's knowledge base and document intelligence work?",
    answer: (
      <p>
        My Lindy's Document Intelligence extracts structured data, entities, and tables from your PDFs, Word documents,
        and spreadsheets. Combined with Context Memory, which remembers previous conversations and document contents, My
        Lindy builds a dynamic knowledge base. This allows AI agents to provide highly context-aware assistance, answer
        questions accurately, and perform tasks with a deep understanding of your specific business information.
      </p>
    ),
  },
  {
    question: "What kind of integrations does My Lindy support?",
    answer: (
      <p>
        My Lindy connects with hundreds of your favorite tools and AI models with one-click native integrations for
        platforms like Gmail, Google Calendar, Slack, HubSpot, Drive, Dropbox, OpenAI, Anthropic's Claude, Grok, and
        many more. We also support custom API integrations and webhooks for end-to-end automation across your entire
        tech stack. Custom integrations are available for enterprise needs.
      </p>
    ),
  },
  {
    question: "What industries does My Lindy cater to?",
    answer: (
      <p>
        Our primary focus is on the insurance, real estate, finance and small-businesses. We build solutions
        specifically designed to serve, aiming to make their work more efficient and their lives better.
      </p>
    ),
  },
  {
    question: "Can I get AI agents customized for my specific business needs?",
    answer: (
      <p>
        Customization is a cornerstone of My Lindy. We excel at creating AI agents precisely tailored to your unique
        workflows, industry requirements, preferred communication style, and specific operational tasks. This deep
        personalization is what makes our platform exceptionally powerful and effective for your business.
      </p>
    ),
  },
  {
    question: "How central is customization to the My Lindy platform?",
    answer: (
      <>
        <p>
          Customization is at the very heart of the My Lindy platform. We believe that AI is most powerful when it's
          perfectly aligned with your unique business processes, not the other way around.
        </p>
        <p className="mt-2">
          Unlike one-size-fits-all solutions, My Lindy allows you to build and tailor AI agents that understand your
          specific workflows, integrate with your proprietary tools, and communicate in your brand's voice. This deep
          level of customization ensures that your agents aren't just performing tasks, but are operating as
          intelligent, integrated members of your team.
        </p>
      </>
    ),
  },
  {
    question: "What kind of customer support do you offer?",
    answer: (
      <p>
        We pride ourselves on providing exceptional customer support. Our team is passionate about helping you succeed
        with My Lindy. We offer comprehensive onboarding assistance, detailed training resources, and responsive
        customer service to address any questions or challenges. We are here to serve you and ensure you get the maximum
        value from our platform.
      </p>
    ),
  },
  {
    question: "Is my data secure with My Lindy?",
    answer: (
      <p>
        Data security is a top priority at My Lindy. We implement robust, industry-standard security measures and best
        practices to protect your information, ensuring its confidentiality and integrity. You can trust that your data
        is handled responsibly and securely within our platform.
      </p>
    ),
  },
  {
    question: "How easy is it to get started with My Lindy?",
    answer: (
      <p>
        Getting started with My Lindy is designed to be straightforward. You can sign up for a suitable plan, connect
        your existing tools and data sources using our easy-to-use integrations, and then begin configuring your AI
        agents. Our extensive documentation and dedicated support team are always available to guide you through every
        step of the process.
      </p>
    ),
  },
  {
    question: "What are My Lindy's Custom Online Forms and their benefits?",
    answer: (
      <>
        <p>
          My Lindy offers a no-code form builder to create mobile-friendly online forms tailored to your workflow,
          allowing you to gather leads, intake clients, or collect customer feedback without writing any code. Key
          benefits include:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>No-Code Creation:</strong> Build custom forms with an intuitive drag-and-drop interface.
          </li>
          <li>
            <strong>Automated CRM Integration:</strong> Instantly send form data to your CRM or prospect database.
          </li>
          <li>
            <strong>Lead Generation Tools:</strong> Capture, qualify, and track leads with built-in analytics.
          </li>
          <li>
            <strong>AI-Ready Forms:</strong> Integrate forms with AI agents for intelligent data processing.
          </li>
          <li>
            <strong>Easy Data Export:</strong> Export submissions to CSV or connect to external systems.
          </li>
          <li>
            <strong>Mobile Responsive Design:</strong> Forms adapt to any screen size.
          </li>
          <li>
            <strong>Smart Conditional Logic:</strong> Show or hide fields based on user input.
          </li>
          <li>
            <strong>Instant Notifications:</strong> Get real-time alerts for new submissions.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "What can I do with My Lindy's online forms?",
    answer: (
      <p>
        You can build contact forms, quote requests, insurance applications, create multi-step client intake forms with
        field validation, collect feedback via customer satisfaction surveys, trigger CRM updates automatically, use
        Zapier to route form data into over 5,000 apps, track form drop-offs and conversion rates, and share forms via a
        link or embed them on any website.
      </p>
    ),
  },
  {
    question: "Are My Lindy's Forms included in all plans?",
    answer: <p>Yes, the ability to build and automate with custom online forms is included with all plans.</p>,
  },
]

export default function Home() {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-white">
        <MainNavbar />

        {/* Hero Section with Futuristic Background */}
        <section
          id="hero"
          className="relative min-h-[700px] md:min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gray-25 border-b border-gray-100"
          style={{
            background: `
linear-gradient(to bottom, white 0%, rgba(249, 250, 251, 0.8) 20%, rgb(249, 250, 251) 80%, white 100%),
radial-gradient(circle at 1px 1px, rgba(0,0,0,0.015) 1px, transparent 0),
linear-gradient(45deg, rgba(0,0,0,0.003) 25%, transparent 25%),
linear-gradient(-45deg, rgba(0,0,0,0.003) 25%, transparent 25%)
`,
            backgroundSize: "100% 100%, 20px 20px, 40px 40px, 40px 40px",
          }}
        >
          {/* Background image using direct blob URL */}
          <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center items-end z-0">
            <Image
              src="/Lindy AI agents for insurance and smal businesses and sales teams (1).svg"
              alt="Lindy AI agents for insurance, small businesses, and sales teams"
              width={1920} // Intrinsic width for aspect ratio
              height={700} // Intrinsic height for aspect ratio (adjust if known)
              className="w-full max-w-none md:max-w-7xl h-auto opacity-90 md:opacity-90 scale-110 md:scale-100"
              priority // For LCP image
              unoptimized
            />
          </div>

          <div className="container px-4 md:px-6 py-8 max-w-[960px] mx-auto relative z-10 flex flex-col items-center justify-center h-full mt-[-40px] mb-[-60px] md:mb-0">
            <SectionTransition
              className="flex flex-col items-center text-center max-w-3xl mx-auto"
              blurBackground={true}
              suggestedQuestions={[
                {
                  question: "Email John about our recent promotion",
                  explanation:
                    "My Lindy integrates with Gmail to help you draft, schedule, and send emails automatically. It can also categorize and prioritize your inbox based on your preferences.",
                },
                {
                  question: "Get a commercial insurance quote from Edison?",
                  explanation:
                    "Yes! My Lindy can connect to Edison's API to fetch insurance quotes, compare options, and help you select the best coverage for your needs.",
                },
                {
                  question: "Schedule a meeting with John for next week",
                  explanation:
                    "My Lindy syncs with your calendar to find optimal meeting times, send invite, and even reschedule appointments automatically when conflicts arise.",
                },
                {
                  question: "What's my lead-to-client conversion rate?",
                  explanation:
                    "My Lindy can connect to your business tools to analyze trends, generate insurance agnecy reports, and provide actionable insights to help grow your business.",
                },
              ]}
            >
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
                AI-infused CRM with
                <br className="hidden md:block" /> AI agents built for you
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                The intelligent CRM that automates your work with a team of AI agents.
              </p>

              <TypingPromptInput />
            </SectionTransition>
          </div>
        </section>

        {/* Gradient overlay section for smooth transition */}
        <section className="relative -mt-16 h-32 bg-gradient-to-b from-white/0 via-white/50 to-white pointer-events-none z-20"></section>

        {/* My Lindy AI Agent Section */}
        <section className="py-24 bg-white">
          <div className="container px-4 md:px-6 max-w-[960px] mx-auto">
            <SectionTransition className="flex flex-col items-center justify-center mb-16">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
                  Deploy an army of AI agents
                  <br className="hidden md:block" /> across your agency
                </h2>
              </div>
            </SectionTransition>

            <div className="mt-8 md:mt-12 w-full max-w-[1200px] mx-auto">
              <Card className="p-6 bg-white border border-gray-100 shadow-sm overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lindy%20ai%20agents%20for%20small%20businesses%2C%20sales%20and%20insurance-U0yP2S7ilkI4q6CyXwY4lZslO8kdHu.svg"
                  alt="My Lindy AI agents for small businesses, sales and insurance"
                  width={1200} // Example intrinsic width
                  height={800} // Example intrinsic height
                  className="w-full h-auto object-contain rounded-md"
                  unoptimized
                />
              </Card>
            </div>

            {/* Replaced the entire div with the new image */}
            <div className="flex justify-center w-full mt-8">
              <Image
                src="/My lindy ai features for crm dallas texas united states (1).svg"
                alt="My Lindy AI features for insurance CRM in Dallas, Texas, United States"
                width={1000} // Example intrinsic width
                height={600} // Example intrinsic height
                className="w-full h-auto object-contain rounded-lg max-w-4xl"
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* CRM Showcase Section */}
        <CrmShowcaseSection />

        {/* Product Showcase with Sticky Layout */}
        <StickyProductShowcase />

        {/* CRM Integration Header */}
        <section className="pt-16 pb-8 bg-white">
          <div className="container px-4 md:px-6 max-w-[960px]">
            <SectionTransition className="flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Integrations</div>
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
                  Connect with your favorite tools
                  <br className="hidden md:block" /> and talk with them
                </h2>
              </div>
            </SectionTransition>
          </div>
        </section>

        {/* Integrations Grid */}
        <IntegrationsGridSimple />

        {/* Modified Features Section (now shows 3 cards) */}
        <FeaturesSection />

        {/* New FAQ Section */}
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="pt-8 max-w-3xl mx-auto border-t border-gray-200 dark:border-gray-800">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-10 text-center text-gray-900 dark:text-white">
                FAQ
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {homeFaqData.map((item, index) => (
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
          </div>
        </section>

        {/* Use Cases */}
        <UseCases />

        {/* Testimonials */}
        <Testimonials />

        <NewsletterCTA />

        <BookDemoModal />
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

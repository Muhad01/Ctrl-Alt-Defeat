"use client"

import Link from "next/link"
import SectionTransition from "@/components/section-transition"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import StructuredData from "@/components/structured-data"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import { Button } from "@/components/ui/button" // Removed
// import BookDemoModal from "@/components/book-demo-modal" // Removed

const faqData = [
  {
    question: "What makes Lindy Forms different from other form builders?",
    answer: (
      <>
        <p className="mb-4">
          The key difference with Lindy Forms is our focus on simplicity and ease of use. We've designed a clean,
          clutter-free interface that lets you build and manage powerful forms without the complexity found in other
          tools.
        </p>
        <p>
          While we offer advanced features like automation and CRM integration, our core philosophy is to provide a
          straightforward, intuitive experience. This means you can get started quickly, build beautiful forms that are
          easy for your customers to fill out, and manage your data without a steep learning curve.
        </p>
      </>
    ),
  },
  {
    question: "How easy is it to create a form? Do I need to code?",
    answer: (
      <>
        <p className="mb-4">
          Creating a form is designed to be simple and intuitive, with no coding required. Our platform features:
        </p>
        <ul className="list-disc list-outside space-y-2 pl-5">
          <li>
            <strong>Drag-and-Drop Builder:</strong> A visual editor lets you build and arrange fields easily.
          </li>
          <li>
            <strong>Form Templates:</strong> Start with pre-designed layouts for common use cases like lead capture,
            intake, or surveys.
          </li>
          <li>
            <strong>Real-Time Preview:</strong> Instantly see how your form will look to users as you build it.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "What types of fields can I add to my forms?",
    answer: (
      <>
        <p className="mb-4">
          Lindy Forms support a wide range of field types to capture the exact data you need, including:
        </p>
        <ul className="list-disc list-outside space-y-2 pl-5">
          <li>Text Input (single line) and Text Area (multi-line)</li>
          <li>Email and Phone with built-in validation</li>
          <li>Number fields with formatting control</li>
          <li>Dropdown, Checkbox, and Radio Group for selections</li>
          <li>Date Picker with a calendar interface</li>
        </ul>
      </>
    ),
  },
  {
    question: "Can I create smart forms that change based on user input?",
    answer: (
      <p>
        Yes. Our <strong>Conditional Logic</strong> feature allows you to create dynamic forms that adapt in real-time.
        You can show or hide specific fields based on a user's previous answers, creating a personalized and more
        efficient experience for the person filling out the form.
      </p>
    ),
  },
  {
    question: "How do Lindy Forms help with lead generation and sales?",
    answer: (
      <>
        <p className="mb-4">
          Lindy Forms are built to directly fuel your sales pipeline. Key automation features include:
        </p>
        <ul className="list-disc list-outside space-y-2 pl-5">
          <li>
            <strong>Prospect Auto-Creation:</strong> Automatically create a new prospect profile in your system the
            moment a form is submitted.
          </li>
          <li>
            <strong>CRM Synchronization:</strong> Connect forms directly to your CRM to ensure lead data is always
            up-to-date without manual entry.
          </li>
          <li>
            <strong>Email Notifications:</strong> Instantly alert sales team members about new leads so they can follow
            up immediately.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "How can I share my forms with my audience?",
    answer: (
      <>
        <p className="mb-4">We offer several flexible publishing and sharing options:</p>
        <ul className="list-disc list-outside space-y-2 pl-5">
          <li>
            <strong>Embed Codes:</strong> Drop a simple HTML snippet to embed the form directly on your website.
          </li>
          <li>
            <strong>Direct Links:</strong> Share a standalone URL for your form, perfect for emails or social media.
          </li>
          <li>
            <strong>Custom Domains:</strong> Host forms under your own branded domain for a seamless brand experience.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "Can I track how well my forms are performing?",
    answer: (
      <p>
        Absolutely. Our built-in analytics provide valuable insights into your form's effectiveness. You can track
        conversion rates, monitor submission patterns over time, and identify drop-off points to understand user
        behavior and optimize your forms for better performance.
      </p>
    ),
  },
  {
    question: "Is it possible for my team to work on forms together?",
    answer: (
      <>
        <p className="mb-4">
          Yes, Lindy Forms are built for collaboration. Our workflow features allow your team to work together
          efficiently:
        </p>
        <ul className="list-disc list-outside space-y-2 pl-5">
          <li>
            <strong>Team Collaboration:</strong> Multiple users can co-edit and manage forms.
          </li>
          <li>
            <strong>Permission Controls:</strong> Define roles for who can view, edit, or publish forms.
          </li>
          <li>
            <strong>Form Duplication:</strong> Quickly copy an existing form to use as a template.
          </li>
          <li>
            <strong>Version Control:</strong> Roll back to a previous version of a form if needed.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "Are Lindy Forms included in the pricing plans?",
    answer: (
      <>
        <p className="mb-2">
          Yes, Lindy Forms are a core feature and are included in both our Single User and Team plans. This means you
          get access to the full suite of form creation, automation, and management tools as part of your subscription.
        </p>
        <p className="mb-2">
          Additionally, all plans come with webhook capabilities, allowing you to easily send form submission data to
          any third-party system or custom endpoint in real-time for advanced integrations.
        </p>
        <p>
          For more details on what each plan offers, please visit our{" "}
          <Link href="/pricing" className="text-primary hover:underline">
            Pricing Page
          </Link>
          .
        </p>
      </>
    ),
  },
]

export default function FormsPage() {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
        <MainNavbar />

        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <SectionTransition className="text-center max-w-3xl mx-auto mb-12">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Forms</div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-gray-900 dark:text-white">
                Automate lead capture{" "}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Instantly create prospects and trigger workflows.
              </p>
              {/* Removed Book Demo Button */}
              <div className="flex justify-center">
                <Image
                  src="/my-lindy-forms-hero.svg"
                  alt="Lindy AI forms for insurance, finance, and marketing"
                  width={576}
                  height={360}
                  className="rounded-lg object-contain w-full max-w-xl"
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
        .prose strong {
          color: inherit;
        }
      `}</style>
    </>
  )
}

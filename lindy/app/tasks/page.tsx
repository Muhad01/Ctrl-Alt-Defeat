"use client"
import SectionTransition from "@/components/section-transition"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import StructuredData from "@/components/structured-data"
import Image from "next/image"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
const faqData = [
  {
    question: "How does task assignment work for teams in My Lindy?",
    answer: (
      <p>
        In My Lindy, you can assign tasks directly to specific team members, which fosters a clear sense of ownership
        and responsibility.
      </p>
    ),
  },
  {
    question: "Can I control who sees which tasks in My Lindy?",
    answer: (
      <p>
        Yes, with My Lindy, you have full control. You can make tasks private for individual focus or visible to the
        entire team for collaborative projects.
      </p>
    ),
  },
  {
    question: "How can I filter tasks by assignee in My Lindy?",
    answer: (
      <p>
        The My Lindy task list can be quickly filtered to show only the tasks assigned to a particular team member,
        helping everyone focus on their responsibilities.
      </p>
    ),
  },
  {
    question: "Is there a way to see unassigned tasks in My Lindy?",
    answer: (
      <p>
        Absolutely. My Lindy provides a dedicated filter that shows all tasks that haven’t been assigned yet, ensuring
        that nothing falls through the cracks.
      </p>
    ),
  },
  {
    question: "What are some examples of how teams use My Lindy task management?",
    answer: (
      <ul className="list-disc list-outside space-y-2 pl-5">
        <li>
          <strong>Sales Teams:</strong> Assign lead follow-ups and track key outreach deadlines using My Lindy.
        </li>
        <li>
          <strong>Managers:</strong> Monitor overdue items and assess workload distribution at a glance with My Lindy.
        </li>
        <li>
          <strong>Cross-functional Teams:</strong> Align on priorities and stay coordinated, even across different time
          zones, through My Lindy.
        </li>
      </ul>
    ),
  },
  {
    question: "What makes My Lindy's task management different?",
    answer: (
      <p>
        The My Lindy To-Do + Calendar system provides task-level precision with the broader context of a calendar. It's
        designed for fast-moving teams that need clarity and coordination without constantly switching between different
        tools. My Lindy is simple enough for individual use but powerful enough to manage an entire team.
      </p>
    ),
  },
  {
    question: "Is this My Lindy task management feature included in my plan?",
    answer: (
      <p>
        Yes, our comprehensive My Lindy task management and team collaboration tools are included with all My Lindy
        plans. You can find more details on our{" "}
        <Link href="/pricing" className="text-primary hover:underline font-medium">
          pricing page
        </Link>
        .
      </p>
    ),
  },
]

export default function TasksPage() {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
        <MainNavbar />

        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <SectionTransition className="text-center max-w-3xl mx-auto mb-12">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tasks</div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-gray-900 dark:text-white">
                Quick create & edit
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Add, update, or remove tasks in seconds.
              </p>
              <div className="flex justify-center">
                <Image
                  src="/my-lindy-ai-tasks.svg"
                  alt="My Lindy tasks for team collaboration and project management"
                  width={576}
                  height={360}
                  className="rounded-lg object-contain w-full max-w-xl h-auto"
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
      .prose ul {
        padding-left: 1.25rem; /* Ensure consistent padding for lists */
      }
      .prose li::marker {
        /* Match forms page - typically default or inherited */
      }
    `}</style>
    </>
  )
}

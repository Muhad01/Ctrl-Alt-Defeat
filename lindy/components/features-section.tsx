"use client"

import StaggeredSectionTransition from "./staggered-section-transition"
import FeatureFlipCard from "./feature-flip-card"
import SectionTransition from "./section-transition" // This is for the section title
import Link from "next/link"

const existingFeatures = [
  {
    title: "Context Memory",
    description:
      "Persistent memory across interactions. Lindy remembers conversations, documents, and preferences for truly intelligent assistance.",
    benefit:
      "Reduces repetitive explanations, enables complex multi-step tasks, and provides highly personalized interactions by understanding historical context.",
  },
  {
    title: "Action Confirmation",
    description:
      "Lindy prompts for your approval before executing critical actions like sending emails or modifying data.",
    benefit:
      "Ensures you maintain full control over important decisions, prevents unintended actions, and builds trust in the AI's operations.",
  },
  {
    title: "Native Integrations",
    description: "Connect Lindy with hundreds of your favorite tools and AI models with one-click native integrations.", // This will be overridden by FeatureFlipCard's internal logic for this specific title
    benefit:
      "Automate workflows across your entire tech stack, from Gmail and Calendar to Slack, HubSpot, OpenAI, and more.", // Also overridden
  },
]

const newHomePageFeatures = [
  {
    title: "Poe Content Generation", // Display title for the card
    description: "AI-powered expert content for insurance, finance, real estate & AI. Engaging, human-like articles.",
    benefit: (
      <>
        Rank high with SEO-friendly content. Automate creation, establish thought leadership.
        <br />
        <Link href="/poe" className="text-primary hover:underline font-medium mt-2 inline-block">
          Learn more about Poe
        </Link>
      </>
    ),
  },
  {
    title: "My Lindy Forms", // Display title
    description: "Intelligent, dynamic forms for lead capture & data collection. Seamless workflow integration.",
    benefit: (
      <>
        Simplify data entry, improve accuracy, automate processes. Custom forms for any need.
        <br />
        <Link href="/forms" className="text-primary hover:underline font-medium mt-2 inline-block">
          Explore My Lindy Forms
        </Link>
      </>
    ),
  },
  {
    title: "My Lindy Tasks", // Display title
    description: "AI-powered task management to organize, automate, and boost team productivity.",
    benefit: (
      <>
        Streamline operations, ensure accountability, let AI handle routine tasks. Focus on priorities.
        <br />
        <Link href="/tasks" className="text-primary hover:underline font-medium mt-2 inline-block">
          Discover My Lindy Tasks
        </Link>
      </>
    ),
  },
]

export default function FeaturesSection() {
  const allFeatures = [...existingFeatures, ...newHomePageFeatures]

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-6">
        <SectionTransition className="mb-12 md:mb-16 text-center">
          <div className="text-sm text-gray-500 mb-2">Also includes </div>
          <h2 className="font-medium tracking-tight text-gray-900 dark:text-white text-4xl md:text-5xl">
            Intelligent features
          </h2>
        </SectionTransition>

        <StaggeredSectionTransition className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {allFeatures.map((feature, index) => (
            <FeatureFlipCard
              key={index}
              title={feature.title}
              description={feature.description}
              benefit={feature.benefit}
            />
          ))}
        </StaggeredSectionTransition>
      </div>
    </section>
  )
}

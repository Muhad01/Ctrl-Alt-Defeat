"use client"

import { ArrowRight } from "lucide-react"
import Image from "next/image"
import SectionTransition from "./section-transition"

export default function CrmShowcaseSection() {
  return (
    <section className="py-24 bg-white">
      <div className="px-4 md:px-6 mx-auto max-w-[960px]">
        <SectionTransition className="flex flex-col items-center justify-center mb-12">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">CRM</div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
              Lindy knows your prospects, clients <br className="hidden md:block" /> and business better than you do
            </h2>
          </div>
        </SectionTransition>

        {/* First card - CRM showcase */}
        <Image
          src="/AI CRM for insurance and sales teams My Lindy (3).svg"
          alt="AI CRM for insurance and sales teams with My Lindy, third version"
          width={950}
          height={500}
          unoptimized
          priority
          className="w-full h-auto max-w-[1050px] md:max-w-[950px] mx-auto"
        />

        {/* Second card - The smartest section */}
        <div className="bg-white rounded-2xl px-6 py-10 md:px-10 mt-8 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Smart and clutter free</h3>
              <p className="text-muted-foreground mb-6">
                Lindy tracks every interaction, writes personalized messages, updates your pipeline, and pulls key
                info—all in real time. The AI CRM functionality is included in all subscription tiers.
              </p>
              <a
                href="/savings"
                className="text-primary flex items-center font-medium hover:underline"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = "/savings"
                }}
              >
                See your savings <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center mb-2">
                  <h4 className="text-xl font-semibold mb-4">AI-infused CRM</h4>
                </div>
                <p className="text-muted-foreground">
                  Manage leads, track customer interactions, and automate follow-ups to improve sales efficiency.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center mb-2">
                  <h4 className="text-xl font-semibold mb-4">Communication tools</h4>
                </div>
                <p className="text-muted-foreground">
                  Send personalized emails and SMS messages directly from the platform, enhancing customer engagement.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center mb-2">
                  <h4 className="text-xl font-semibold mb-4">Business intelligence</h4>
                </div>
                <p className="text-muted-foreground">
                  Gain insights into your operations with analytics on customer behavior, team performance, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

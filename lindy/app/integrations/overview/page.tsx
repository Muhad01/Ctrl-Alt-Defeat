"use client"
import Image from "next/image"

import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardTitle } from "@/components/ui/card"

interface IntegrationItem {
  name: string
  description: string
  logoFilename: string
  directUrl?: string
}

interface IntegrationCategory {
  title: string
  integrations: IntegrationItem[]
}

const integrationData: IntegrationCategory[] = [
  {
    title: "AI Models",
    integrations: [
      { name: "OpenAI", description: "AI language model for chat and text generation", logoFilename: "openai.svg" },
      {
        name: "Grok",
        description: "xAI's conversational AI model",
        logoFilename: "grok-light.svg",
        directUrl: "https://blobs.vusercontent.net/blob/grok-light%20logo-MK4B6FP7KImcmlheXJxB4tjUasEIUx.svg",
      },
      { name: "Anthropic", description: "Claude AI assistant for advanced reasoning", logoFilename: "anthropic.png" },
      { name: "Google AI", description: "Google's AI services and search integration", logoFilename: "google-ai.svg" },
    ],
  },
  {
    title: "Insurance APIs",
    integrations: [
      { name: "Fenris", description: "Comprehensive insurance data and property details", logoFilename: "fenris.png" },
      {
        name: "Progressive",
        description: "Pre-populate insurance quote data & rate quotes API",
        logoFilename: "progressive.svg",
        directUrl: "https://blobs.vusercontent.net/blob/Progressive%20%283%29-b9Dv8JuaYZ9aNpToZPYdMSa7zznqf5.svg",
      },
      { name: "Edison AI", description: "Insurance underwriting and risk assessment", logoFilename: "edison.png" },
      { name: "AgencyZoom", description: "Insurance agency management system", logoFilename: "agencyzoom.svg" },
      { name: "HawkSoft", description: "Agency management and client tracking", logoFilename: "hawksoft.png" },
      {
        name: "Ezlynx",
        description: "Insurance agency management and rating software.",
        logoFilename: "ezlynx.png",
        directUrl:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EZlogo-redblack_1-TALssNpkFgY3ceaqqUqEtTf9B2N5Me.png",
      },
      {
        name: "NowCerts",
        description: "Agency Management System for insurance.",
        logoFilename: "nowcerts-logo.png",
        directUrl:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/momentumamp_logo%201-HHGOJv87AxVhnebjjase5oZFTrEGj9.png",
      },
      {
        name: "Ivans Download",
        description: "Automated insurance policy data download from carriers.",
        logoFilename: "ivans.png", // Will use the newly added image from public/logos/integrations/
      },
    ],
  },
  {
    title: "CRM & Sales",
    integrations: [
      {
        name: "Salesforce",
        description: "Customer relationship management and sales automation",
        logoFilename: "salesforce.svg",
        directUrl:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Salesforce%20logo%20%281%29-gMKcHyV2ZuQVb3YdsOq7R7c124YjI4.svg",
      },
    ],
  },
  {
    title: "Communication",
    integrations: [
      { name: "OpenPhone", description: "Business phone and SMS service", logoFilename: "openphone.png" },
      {
        name: "Twilio",
        description: "SMS and voice communication platform",
        logoFilename: "twilio-icon.svg",
        directUrl: "https://blobs.vusercontent.net/blob/twilio-icon-x1m7qJiBqqqLVelRWmekIayLRsmAmG.svg",
      },
      {
        name: "Slack",
        description: "Team messaging and notifications",
        logoFilename: "slack-icon.svg",
        directUrl: "https://blobs.vusercontent.net/blob/slack-icon%20logo-U5vQHRcygIJt3V77SyV74ipXEHWJIO.svg",
      },
      { name: "Gmail", description: "Email integration and management", logoFilename: "gmail.svg" },
      {
        name: "ElevenLabs",
        description: "AI voice synthesis and text-to-speech.",
        logoFilename: "elevenlabs.svg",
        directUrl: "https://blobs.vusercontent.net/blob/elevenlabs%20logo-htzveYL54Gkb7ULlXSc9gDKHtYaVQD.svg",
      },
      {
        name: "Microsoft 365",
        description: "Productivity suite including Outlook, Teams, and Office apps.",
        logoFilename: "microsoft-365.svg",
        directUrl: "https://blobs.vusercontent.net/blob/Microsoft%20logo-yrD5CVEnuGzqUw1Y2DdXCkBpqL39vR.svg",
      },
      { name: "Loops", description: "Email automation and campaigns", logoFilename: "loops.png" },
      { name: "Poe", description: "AI chatbot platform with multiple models", logoFilename: "poe-logo-red.svg" },
      {
        name: "Google Calendar",
        description: "Calendar integration and scheduling",
        logoFilename: "google-calendar.svg",
      },
      {
        name: "Calendly",
        description: "Appointment scheduling and calendar management",
        logoFilename: "calendly.svg",
        directUrl: "https://blobs.vusercontent.net/blob/Calendly-bKvIU37lYPWpeLlRHkV7zkbnNr9oI6.svg",
      },
      {
        name: "Mailchimp",
        description: "Email marketing and automation platform",
        logoFilename: "mailchimp-logo.svg",
      },
    ],
  },
  {
    title: "File Processing & Forms",
    integrations: [
      {
        name: "ACORD Me Not",
        description: "Parse and structure ACORD insurance forms",
        logoFilename: "acord-me-not-antler.png",
      },
      {
        name: "File Parser",
        description: "Document processing and data extraction",
        logoFilename: "file-parser.svg",
        directUrl: "https://blobs.vusercontent.net/blob/python-fl6veHGYwdhZDRVghLEhdVoPdDruvS.svg",
      },
    ],
  },
  {
    title: "Data & Analytics",
    integrations: [
      { name: "Weather API", description: "Current conditions and forecasts", logoFilename: "weather.png" },
      { name: "Google Trends", description: "Search trend data and insights", logoFilename: "google-trends.png" },
      {
        name: "Clay",
        description: "Data enrichment and automation platform",
        logoFilename: "clay.svg",
      },
      {
        name: "Google Drive",
        description: "Cloud storage and file synchronization service.",
        logoFilename: "google-drive.svg",
        directUrl: "https://blobs.vusercontent.net/blob/google-drive%20logo-n0FlHX1gyyfmAsICemAP1o9iXIMPgu.svg",
      },
    ],
  },
  {
    title: "Automation",
    integrations: [
      {
        name: "Zapier",
        description: "Workflow automation and app connections",
        logoFilename: "zapier-icon.svg",
        directUrl: "https://blobs.vusercontent.net/blob/zapier-icon%20%281%29-FhoWzbCmoJcQSbSVoEyIBHOlDyQ4dU.svg",
      },
      {
        name: "Webhook integrations",
        description: "Custom API endpoints for data flow",
        logoFilename: "webhooks.svg",
        directUrl: "https://blobs.vusercontent.net/blob/webhooks-bojj1EPrSrwRQGOOaE4ByEWzhVxgx5.svg",
      },
      {
        name: "Workflow Builder",
        description: "Custom workflow automation and process management",
        logoFilename: "workflow.png",
      },
    ],
  },
  {
    title: "Accounting",
    integrations: [
      {
        name: "Quickbooks",
        description: "Popular accounting software for small businesses.",
        logoFilename: "quickbooks.svg",
        directUrl: "https://blobs.vusercontent.net/blob/Quickbooks%20logo-SmJVREQ394RLCXZsTuQWuXMlgCt2XU.svg",
      },
    ],
  },
]

export default function IntegrationsOverviewPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      <MainNavbar />
      <main className="flex-grow py-8 md:py-12">
        <div className="container px-4 md:px-6 md:max-w-[860px]">
          {integrationData.map((category) => (
            <section key={category.title} className="mb-10 md:mb-14">
              <h2 className="text-lg md:text-xl font-semibold mb-6 md:mb-8 text-gray-800 dark:text-gray-200">
                {category.title}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {category.integrations.map((integration) => {
                  const imagePath = `/logos/integrations/${integration.logoFilename}`
                  const isSvgFromPublic = !integration.directUrl && integration.logoFilename.endsWith(".svg")

                  return (
                    <Card
                      key={integration.name}
                      className="overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm"
                    >
                      <CardContent className="flex flex-col items-center justify-center p-5 aspect-square">
                        <div className="relative h-12 w-12 mb-4">
                          {integration.directUrl ? (
                            <img
                              src={integration.directUrl || "/placeholder.svg"} // Use direct blob URL
                              alt={`${integration.name} logo`}
                              className="w-full h-full object-contain rounded-md"
                              onError={(e) => {
                                console.error(
                                  `Failed to load image from directUrl: ${integration.name} - Src: ${integration.directUrl}`,
                                )
                                // Do not set to placeholder to meet the requirement
                              }}
                            />
                          ) : isSvgFromPublic ? (
                            <img // SVGs from public folder (if any are still working this way)
                              src={imagePath || "/placeholder.svg"}
                              alt={`${integration.name} logo`}
                              className="w-full h-full object-contain rounded-md"
                              onError={(e) => {
                                console.error(
                                  `Failed to load SVG from public path: ${integration.name} - Src: ${imagePath}`,
                                )
                                // Do not set to placeholder
                              }}
                            />
                          ) : (
                            <Image // PNGs from public folder (if any are still working this way)
                              src={imagePath || "/placeholder.svg"}
                              alt={`${integration.name} logo`}
                              fill
                              sizes="(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 48px"
                              className="object-contain rounded-md"
                              onError={(e) => {
                                console.error(
                                  `Failed to load PNG with Next/Image: ${integration.name} - Src: ${imagePath}`,
                                )
                                // Do not set to placeholder
                              }}
                            />
                          )}
                        </div>
                        <CardTitle className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
                          {integration.name}
                        </CardTitle>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

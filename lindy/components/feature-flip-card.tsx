"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FeatureFlipCardProps {
  title: string
  description: string | ReactNode
  benefit: string | ReactNode
  accentColor?: string
  hideWhatItDoes?: boolean
  hideHeading?: boolean
  isHowItWorks?: boolean
  disableFlip?: boolean
}

export default function FeatureFlipCard({
  title,
  description,
  benefit,
  accentColor = "rgba(99, 102, 241, 0.8)",
  hideWhatItDoes = false,
  hideHeading = false,
  isHowItWorks = false,
  disableFlip = false,
}: FeatureFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Convert the accent color to a solid version for the card back
  const solidAccentColor = accentColor.replace("0.8", "1")

  // Function to handle clicks (toggle flip state)
  const handleClick = () => {
    if (!disableFlip) {
      setIsFlipped(!isFlipped)
    }
  }

  // Check if this is the card to be repurposed for "Knowledge Base"
  const isKnowledgeBaseTargetCard = title === "Context Memory"
  // Check if this is the "Native Integrations" card
  const isNativeIntegrationsCard = title === "Native Integrations"
  // Check if this is the "How it works" card
  const isHowItWorksCard = title === "How it works"

  let currentTitle = title
  let currentDescription = description
  let currentBenefit = benefit

  if (isKnowledgeBaseTargetCard) {
    currentTitle = "Knowledge Base"
    currentDescription =
      "Empower your users and teams with an AI-powered knowledge base. Instantly access accurate information, troubleshoot issues, and find answers to common questions, 24/7."
    currentBenefit =
      "Boosts team productivity by providing quick self-service answers, reduces support tickets by empowering users to find solutions independently, and ensures consistent information delivery across your organization."
  } else if (isNativeIntegrationsCard) {
    currentDescription = (
      <div className="space-y-2">
        <p>Seamlessly connect Lindy with your existing tools. We support a wide range of native integrations:</p>
        <div className="text-xs space-y-1">
          <p>• Agency Zoom, NowCerts, Hawksoft</p>
          <p>• Fenris, Progressive, Loops</p>
          <p>• OpenPhone, Google Calendar, Gemini</p>
          <p>• Twilio, Zapier & more</p>
        </div>
      </div>
    )
    currentBenefit =
      "Automate tasks across your software stack, enhance data flow between applications, and leverage specialized AI agents for unique business processes, all within a unified platform."
  } else if (isHowItWorksCard) {
    currentDescription =
      "Lindy is designed specifically for insurance, finance, and small business owners of all shapes and sizes. Get started with Lindy's AI assistant in minutes and let AI handle your routine tasks automatically."
    currentBenefit = (
      <>
        <p className="mb-3 text-sm">
          Lindy was built for insurance agencies, real estate companies, financial services and sales teams.
        </p>
        <div className="space-y-2">
          <p className="font-medium">Ready-to-use integrations:</p>
          <p>• Email, Calendar, CRM, Documents</p>
          <p>• OpenAI, Claude, Grok AI models</p>
          <p>• Document parsing & form generation</p>
          <p>• Google Calendar, Gemini, OpenPhone</p>
          <p>• Agency Zoom, NowCerts, Hawksoft</p>
          <p>• Fenris, Progressive, Loops</p>
          <p>• Twilio, Zapier & more</p>
          <p className="text-xs mt-2">Custom integrations available on request</p>
        </div>
      </>
    )
  }

  return (
    <div className="perspective-1000 h-[320px] w-full" onClick={handleClick}>
      <div
        className={cn(
          "relative w-full h-full transition-all duration-500 preserve-3d",
          !disableFlip && "cursor-pointer",
        )}
        style={{
          transform: !disableFlip && isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front face of card */}
        <div
          className="absolute w-full h-full backface-hidden rounded-xl border border-gray-200 dark:border-gray-600 bg-[#FAFBFC] dark:bg-gray-950 p-6 flex flex-col shadow-sm"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <h3 className="text-xl font-medium mb-3">{currentTitle}</h3>
          <div className="text-sm text-muted-foreground flex-grow">
            {typeof currentDescription === "string" ? currentDescription : currentDescription}
          </div>
          {!disableFlip && <div className="mt-4 text-xs text-primary font-medium">Click to learn more</div>}
        </div>

        {/* Back face of card */}
        <div
          className="absolute w-full h-full backface-hidden rounded-lg border border-gray-200 dark:border-gray-800 p-6 flex flex-col bg-white dark:bg-gray-950"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="space-y-4 flex-grow overflow-auto pt-1">
            {isHowItWorks ? (
              <div className="text-sm text-muted-foreground">
                {typeof currentBenefit === "string" ? currentBenefit : currentBenefit}
              </div>
            ) : (
              <>
                {!hideWhatItDoes && (
                  <div>
                    <h4 className="text-sm font-medium text-black">What it does</h4>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {typeof currentDescription === "string" ? currentDescription : currentDescription}
                    </div>
                  </div>
                )}

                <div>
                  {!hideHeading && (
                    <h4 className="text-sm font-medium text-black">
                      {hideWhatItDoes ? "Testimonial" : isNativeIntegrationsCard ? "Integrations" : "How it helps you"}
                    </h4>
                  )}
                  <div className={hideHeading ? "text-sm text-muted-foreground" : "mt-1 text-sm text-muted-foreground"}>
                    {isNativeIntegrationsCard ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-1">
                          <p>• Agency Zoom, NowCerts, Hawksoft</p>
                          <p>• Fenris, Progressive, Loops</p>
                          <p>• OpenPhone, Google Calendar, Gemini</p>
                          <p>• Twilio, Zapier, Slack</p>
                          <p>• OpenAI, Claude, Grok AI</p>
                          <p>• Gmail, Outlook, Google Drive</p>
                          <p>• HubSpot, Zoho, Salesforce</p>
                          <p>• Asana, Trello, Monday.com</p>
                          <p className="text-xs mt-1">Custom integrations available on request</p>
                        </div>
                      </div>
                    ) : typeof currentBenefit === "string" ? (
                      currentBenefit
                    ) : (
                      currentBenefit
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {!disableFlip && (
            <div className="mt-4 pt-2 text-xs font-medium text-black border-t border-gray-200">
              {isHowItWorks ? "Click to flip back to step" : "Click to flip back"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

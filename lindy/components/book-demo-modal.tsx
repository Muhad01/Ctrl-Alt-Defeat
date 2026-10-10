"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

declare global {
  interface Window {
    Calendly: any
  }
}

function CalendlyModalContent() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const calendlyContainer = document.getElementById("calendly-inline-widget")
      if (calendlyContainer && typeof window !== "undefined") {
        calendlyContainer.innerHTML = ""
        if (window.Calendly && window.Calendly.initInlineWidget) {
          try {
            window.Calendly.initInlineWidget({
              url: "https://calendly.com/strawberryantler/30min?hide_event_type_details=1&hide_gdpr_banner=1",
              parentElement: calendlyContainer,
              prefill: {},
              utm: {},
            })
          } catch (error) {
            console.error("Error initializing Calendly widget:", error)
            calendlyContainer.innerHTML = `
              <iframe 
                src="https://calendly.com/strawberryantler/30min?hide_event_type_details=1&hide_gdpr_banner=1&embed_domain=${window.location.hostname}&embed_type=Inline" 
                width="100%" 
                height="580" 
                frameBorder="0"
                title="Schedule a meeting">
              </iframe>
            `
          }
        } else {
          calendlyContainer.innerHTML = `
            <iframe 
              src="https://calendly.com/strawberryantler/30min?hide_event_type_details=1&hide_gdpr_banner=1&embed_domain=${window.location.hostname}&embed_type=Inline" 
              width="100%" 
              height="580" 
              frameBorder="0"
              title="Schedule a meeting">
            </iframe>
          `
        }
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-[520px] bg-white rounded-[0.5rem] font-outfit">
      <div
        id="calendly-inline-widget"
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minWidth: "320px", height: "520px" }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600 font-outfit">Loading calendar...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookDemoModal({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px] max-w-[85vw] max-h-[85vh] p-0 overflow-hidden border-0 shadow-2xl transition-all duration-300 ease-in-out mx-auto rounded-[0.5rem] bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <CalendlyModalContent />
      </DialogContent>
    </Dialog>
  )
}

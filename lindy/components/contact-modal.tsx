"use client"

import React from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import ContactForm from "./contact-form"

interface ContactModalProps {
  children: React.ReactNode
  dialogTitle?: string
  dialogDescription?: string
}

export default function ContactModal({
  children,
  dialogTitle = "Get in Touch",
  dialogDescription = "We'll get back to you as soon as possible.",
}: ContactModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="focus:outline-none focus:ring-0">{children}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-w-[90vw] max-h-[85vh] overflow-y-auto bg-white shadow-xl transition-all duration-300 ease-in-out mx-auto p-4 sm:p-6 rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <ContactForm setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}

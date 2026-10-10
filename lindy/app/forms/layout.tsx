import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Intelligent Forms | Lindy AI",
  description:
    "Streamline data collection and processing with Lindy's AI-powered online forms. Create, customize, and integrate forms seamlessly into your workflows.",
}

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

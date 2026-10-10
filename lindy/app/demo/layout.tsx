import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demo AI Solutions | My Lindy AI",
  description:
    "Experience our AI agents in action. Book a demo to see how My Lindy AI can transform your business with custom AI solutions.",
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

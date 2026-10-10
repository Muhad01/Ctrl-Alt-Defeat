import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Time & Cost Savings | Lindy AI",
  description: "See how Lindy AI transforms your daily workflow with measurable time savings and productivity gains.",
}

export default function SavingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

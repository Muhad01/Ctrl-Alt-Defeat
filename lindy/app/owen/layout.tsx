import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Owen AI Agent | Lindy AI",
  description:
    "Meet Owen, your AI-powered teammate for visual web automation. Owen understands buttons, forms, and visual content to automate your daily tasks.",
}

export default function OwenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

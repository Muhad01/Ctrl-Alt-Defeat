import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Poe Integration | Lindy AI",
  description:
    "Integrate Lindy AI with Poe to unlock advanced conversational AI capabilities, streamline workflows, and enhance your AI agent interactions.",
}

export default function PoeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

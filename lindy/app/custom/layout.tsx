import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Custom AI Solutions | Lindy AI",
  description:
    "Develop bespoke AI agents tailored to your unique business needs. Lindy AI helps you build custom AI solutions for enhanced productivity.",
}

export default function CustomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

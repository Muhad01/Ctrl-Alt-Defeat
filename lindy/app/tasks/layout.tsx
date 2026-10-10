import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team Tasks & Collaboration | Lindy AI",
  description:
    "Manage team tasks, assignments, and collaboration seamlessly with Lindy AI. Track progress, filter by assignee, and ensure nothing gets missed.",
}

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

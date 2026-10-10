import type React from "react"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNavbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}

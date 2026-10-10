import type React from "react"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"

export default function SwitchboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MainNavbar />
      {/* Removed duplicate MainNavbar */}
      {children}
      <Footer />
      {/* Removed duplicate Footer */}
    </>
  )
}

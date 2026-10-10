import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import TermsOfServiceTemplate from "@/components/terms-of-service-template"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms of Service | My Lindy MCP AI Assistant",
  description: "Terms of Service for using My Lindy AI platform and services.",
}

export default function TermsPage() {
  const companyName = "Strawberry Antler, Inc."
  const websiteName = "My Lindy AI Platform"
  const websiteUrl = "https://mylindy.com"
  const contactEmail = "support@strawberryantler.com"
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNavbar />

      <main className="flex-grow bg-white">
        <section className="py-12 md:py-16 bg-white">
          <div className="container max-w-4xl">
            <div className="mb-8">
              <Button variant="ghost" size="sm" asChild className="mb-6">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
            </div>

            <TermsOfServiceTemplate
              companyName={companyName}
              websiteName={websiteName}
              websiteUrl={websiteUrl}
              contactEmail={contactEmail}
              effectiveDate={currentDate}
              lastUpdated={currentDate}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

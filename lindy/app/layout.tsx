import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import FloatingBookDemo from "@/components/floating-book-demo"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "My Lindy | The all-in-one AI-infused CRM with and army of custom AI agents built for insurance.",
  description:
    "Lindy is the best AI-infused CRM purpose-built for insurance agencies, giving teams superpowers by embedding intelligent agents into every customer interaction—so you can scale personalized service, automate complex workflows, and grow without increasing headcount.",
  keywords:
    "AI insurance, AI business assistant, AI automation, AI Agents, AI small business, MCP server, AI CRM, Sales AI agents, Custom-built AI agents, Insurance CRM, AI Insurance CRM, AI Fianance CRM, AI Real Estate CRM, Insurance CRM, Insurance AI CRM,MY LINDY, Lindy, Lindy AI Insurance CRM, Strawberry Antler",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mylindy.com",
    title: "The all-in-one CRM with an army of AI agents built for insurance.",
    description:
      "Lindy is the best AI-infused CRM purpose-built for insurance and finance, giving teams superpowers by embedding intelligent agents into every customer interaction—so you can scale personalized service, automate complex workflows, and grow without increasing headcount.",
    siteName: "My Lindy",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lindy%20AI%20Open%20Graph%20image%20by%20Strawberry%20antler-mG8Z9bDi0O9HeOiOcFZH5zx56jFOKH.png",
        width: 1200,
        height: 630,
        alt: "My Lindy Insurance AI - Custom AI agents and CRM for insurance.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Lindy | The all-in-one CRM with and army of custom-built AI agents built for insurance.",
    description:
      "Lindy is the best AI-infused CRM purpose-built for insurance, giving teams superpowers by embedding intelligent agents into every customer interaction—so you can scale personalized service, automate complex workflows, and grow without increasing headcount.",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lindy%20AI%20Open%20Graph%20image%20by%20Strawberry%20antler-mG8Z9bDi0O9HeOiOcFZH5zx56jFOKH.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.png" }],
    apple: [{ url: "/favicon.png" }],
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-6LT083R3P3"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-6LT083R3P3');
        `,
          }}
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        {/* Calendly badge widget CSS */}
      </head>
      <body className={`${outfit.variable} ${outfit.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <FloatingBookDemo />
        </ThemeProvider>

        {/* Calendly inline widget script */}
        <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}

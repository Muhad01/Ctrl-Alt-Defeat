"use client"

import { Card } from "@/components/ui/card"
import SectionTransition from "@/components/section-transition"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import StructuredData from "@/components/structured-data"
import { useState } from "react"

export default function SavingsPage() {
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({})

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-white">
        <MainNavbar />

        {/* Time and Cost Savings Section */}
        <section className="py-24 bg-white">
          <div className="container px-4 md:px-6 max-w-[960px] mx-auto">
            <SectionTransition className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-sm text-gray-500 mb-2">Savings</div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Measurable productivity gains</h1>
            </SectionTransition>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Outbound messaging flip card */}
              <div className="perspective-1000 h-[160px] w-full">
                <div
                  className="relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer group"
                  onClick={() => toggleCard("outbound")}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["outbound"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border-b border-gray-200 shadow-none rounded-lg flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="font-semibold text-2xl mb-2">5–10 minutes</h3>
                    <p className="text-sm text-muted-foreground">saved per message</p>
                  </Card>
                  {/* Back face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border border-gray-200 shadow-none rounded-lg flex flex-col justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <h3 className="font-semibold text-lg mb-3">Outbound messaging</h3>
                    <p className="text-sm text-muted-foreground">
                      AI replaces manual message writing with 30-second automated, customized content—at scale.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Data processing flip card */}
              <div className="perspective-1000 h-[160px] w-full">
                <div
                  className="relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer group"
                  onClick={() => toggleCard("data")}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["data"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border-b border-gray-200 shadow-none rounded-lg flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="font-semibold text-2xl mb-2">15–20 minutes</h3>
                    <p className="text-sm text-muted-foreground">saved per lead</p>
                  </Card>
                  {/* Back face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border border-gray-200 shadow-none rounded-lg flex flex-col justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <h3 className="font-semibold text-lg mb-3">Data processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Auto-parsing of forms and documents eliminates manual data entry and processing time.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Quote turnaround flip card */}
              <div className="perspective-1000 h-[160px] w-full">
                <div
                  className="relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer group"
                  onClick={() => toggleCard("quote")}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["quote"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border-b border-gray-200 shadow-none rounded-lg flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="font-semibold text-2xl mb-2">30–45 minutes</h3>
                    <p className="text-sm text-muted-foreground">saved per quote</p>
                  </Card>
                  {/* Back face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border border-gray-200 shadow-none rounded-lg flex flex-col justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <h3 className="font-semibold text-lg mb-3">Quote turnaround</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time quoting replaces manual carrier checks and comparison shopping.
                    </p>
                  </Card>
                </div>
              </div>

              {/* CRM updates flip card */}
              <div className="perspective-1000 h-[160px] w-full">
                <div
                  className="relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer group"
                  onClick={() => toggleCard("crm")}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["crm"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border-b border-gray-200 shadow-none rounded-lg flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="font-semibold text-2xl mb-2">5+ minutes</h3>
                    <p className="text-sm text-muted-foreground">saved per interaction</p>
                  </Card>
                  {/* Back face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border border-gray-200 shadow-none rounded-lg flex flex-col justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <h3 className="font-semibold text-lg mb-3">CRM updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatic logging and timeline updates eliminate manual CRM data entry.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Document review flip card */}
              <div className="perspective-1000 h-[160px] w-full">
                <div
                  className="relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer group"
                  onClick={() => toggleCard("document")}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["document"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border-b border-gray-200 shadow-none rounded-lg flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="font-semibold text-2xl mb-2">20–30 minutes</h3>
                    <p className="text-sm text-muted-foreground">saved per document</p>
                  </Card>
                  {/* Back face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border border-gray-200 shadow-none rounded-lg flex flex-col justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <h3 className="font-semibold text-lg mb-3">Document review</h3>
                    <p className="text-sm text-muted-foreground">
                      AI extracts structured data from insurance documents, eliminating manual review time.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Research time flip card */}
              <div className="perspective-1000 h-[160px] w-full">
                <div
                  className="relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer group"
                  onClick={() => toggleCard("research")}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flippedCards["research"] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border-b border-gray-200 shadow-none rounded-lg flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="font-semibold text-2xl mb-2">Hours</h3>
                    <p className="text-sm text-muted-foreground">of research eliminated</p>
                  </Card>
                  {/* Back face */}
                  <Card
                    className="absolute w-full h-full p-6 bg-white border border-gray-200 shadow-none rounded-lg flex flex-col justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <h3 className="font-semibold text-lg mb-3">Research time</h3>
                    <p className="text-sm text-muted-foreground">
                      Market, weather, and business context are provided instantly—no manual research needed.
                    </p>
                  </Card>
                </div>
              </div>
            </div>

            {/* Business impact flip card */}
            <div className="perspective-1000 h-[160px] w-full mb-8">
              <div
                className="relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer"
                onClick={() => toggleCard("business")}
                style={{
                  transformStyle: "preserve-3d",
                  transform: flippedCards["business"] ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front face */}
                <Card
                  className="absolute w-full h-full p-6 bg-white border-b border-gray-200 shadow-none rounded-lg flex flex-col justify-center items-center text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <h3 className="font-semibold text-2xl mb-2">40–60 hours monthly</h3>
                  <p className="text-sm text-muted-foreground">saved per user</p>
                </Card>
                {/* Back face */}
                <Card
                  className="absolute w-full h-full p-6 bg-white border border-gray-200 shadow-none rounded-lg flex flex-col justify-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <h3 className="font-semibold text-lg mb-3">Business impact</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-gray-900">40–60 hours monthly</span> and{" "}
                    <span className="font-semibold text-gray-900">480–720 hours yearly</span> per user, enabling lower
                    costs and faster response times.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}

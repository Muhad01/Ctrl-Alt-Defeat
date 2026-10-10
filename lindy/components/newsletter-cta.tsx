"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function NewsletterCTA() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Send data to our API route which forwards to Zapier
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form")
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section className="py-24 bg-white">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm text-gray-500 mb-2">Newsletter</div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Get the latest updates</h2>
        </div>

        <Card className="p-8 md:p-12 shadow-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 max-w-2xl mx-auto rounded-lg">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Thank you for subscribing!</h3>
              <p className="text-muted-foreground">You'll receive our latest updates soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="flex-1 h-10 sm:h-12 text-base border border-gray-200 focus:border-gray-400 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none rounded-lg"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 h-10 sm:h-12 text-base font-medium transition-colors rounded-lg border-0 flex-shrink-0"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </form>
          )}
        </Card>
      </div>
    </section>
  )
}

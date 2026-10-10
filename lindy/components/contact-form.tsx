"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    size: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Send data to our API route which forwards to Zapier
      const nameParts = formData.name.trim().split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          company: formData.company,
          size: formData.size,
          message: formData.message,
          source: "contact-form",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form")
      }

      setIsSubmitting(false)
      setIsSubmitted(true)
    } catch (err) {
      console.error("Error submitting form:", err)
      setIsSubmitting(false)
      setError("Something went wrong. Please try again.")
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <Card className="bg-white border-none shadow-none">
        <CardContent className="pt-8 pb-6 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-4 max-w-sm text-sm">We'll get back to you within 24 hours.</p>
          <Button onClick={() => setIsSubmitted(false)} variant="outline" size="sm">
            Submit Another
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-none shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Get in Touch</CardTitle>
        <p className="text-muted-foreground text-sm">Tell us how Lindy can help your business.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-9 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none bg-gray-50 transition-all duration-200 ease-in-out"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium">
              Work Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-9 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none bg-gray-50 transition-all duration-200 ease-in-out"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="company" className="text-sm font-medium">
                Company *
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="h-9 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none bg-gray-50 transition-all duration-200 ease-in-out"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="size" className="text-sm font-medium">
                Team Size
              </Label>
              <Select value={formData.size} onValueChange={(value) => handleChange("size", value)}>
                <SelectTrigger className="h-9 border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none bg-gray-50 transition-all duration-200 ease-in-out">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="501+">501+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="message" className="text-sm font-medium">
              How can we help? *
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              className="min-h-[80px] border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none resize-none bg-gray-50 transition-all duration-200 ease-in-out"
              rows={3}
              required
            />
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-9 bg-black hover:bg-gray-800 text-white font-medium transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              "Send Message"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By submitting, you agree to our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              privacy policy
            </a>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

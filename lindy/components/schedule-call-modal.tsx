"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Clock, User, Mail, MessageSquare, CheckCircle2 } from "lucide-react"
import { format, addDays, setHours, setMinutes, isWeekend, isBefore, startOfDay } from "date-fns"

interface TimeSlot {
  time: string
  available: boolean
}

export default function ScheduleCallModal() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [step, setStep] = useState<"date" | "time" | "details" | "confirmation">("date")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })

  // Generate available time slots (9 AM to 5 PM, excluding lunch 12-1 PM)
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const hours = [9, 10, 11, 13, 14, 15, 16, 17] // Skip 12 PM (lunch)

    hours.forEach((hour) => {
      const slotTime = setMinutes(setHours(date, hour), 0)
      const timeString = format(slotTime, "h:mm a")

      // Mark some slots as unavailable for demo purposes
      const isAvailable = Math.random() > 0.3 // 70% availability

      slots.push({
        time: timeString,
        available: isAvailable,
      })
    })

    return slots
  }

  // Filter out weekends and past dates
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date())
    return isWeekend(date) || isBefore(date, today)
  }

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : []

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime("")
    if (date) {
      setStep("time")
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep("details")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setStep("confirmation")
  }

  const resetModal = () => {
    setStep("date")
    setSelectedDate(undefined)
    setSelectedTime("")
    setFormData({ name: "", email: "", company: "", message: "" })
  }

  return (
    <Dialog onOpenChange={(open) => !open && resetModal()}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-0"
          size="lg"
        >
          <CalendarDays className="w-5 h-5 mr-2" />
          Schedule a Call
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-w-[90vw] max-h-[85vh] overflow-y-auto bg-white shadow-xl transition-all duration-300 ease-in-out mx-auto p-4 sm:p-6 rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="w-5 h-5" />
            Schedule a Call with Our Team
          </DialogTitle>
          <DialogDescription>
            Book a 30-minute consultation to discuss how Lindy can transform your business operations.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 py-4">
          {["date", "time", "details", "confirmation"].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === stepName
                    ? "bg-black text-white"
                    : index < ["date", "time", "details", "confirmation"].indexOf(step)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < ["date", "time", "details", "confirmation"].indexOf(step) ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div
                  className={`w-8 h-0.5 mx-2 transition-colors ${
                    index < ["date", "time", "details", "confirmation"].indexOf(step) ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Date Selection */}
        {step === "date" && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Select a Date</h3>
              <p className="text-sm text-muted-foreground">Choose a day that works best for you</p>
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                fromDate={new Date()}
                toDate={addDays(new Date(), 30)}
                className="rounded-md border"
              />
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Available Monday - Friday • Weekends excluded
            </div>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === "time" && selectedDate && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Select a Time</h3>
              <p className="text-sm text-muted-foreground">
                Available slots for {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                  className="h-12 text-sm focus:outline-none focus:ring-0"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {slot.time}
                </Button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("date")} className="focus:outline-none focus:ring-0">
                Back to Date
              </Button>
              <div className="text-xs text-muted-foreground self-center">All times shown in your local timezone</div>
            </div>
          </div>
        )}

        {/* Step 3: Details Form */}
        {step === "details" && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Your Details</h3>
              <p className="text-sm text-muted-foreground">Tell us about yourself and what you'd like to discuss</p>
            </div>

            {/* Selected Date & Time Summary */}
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTime}</span>
                </div>
              </div>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 focus:outline-none focus:ring-0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 focus:outline-none focus:ring-0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company/Organization</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="focus:outline-none focus:ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">What would you like to discuss? *</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="message"
                    placeholder="Tell us about your business needs, current challenges, or specific questions about Lindy..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="pl-10 min-h-[100px] focus:outline-none focus:ring-0"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("time")}
                  className="focus:outline-none focus:ring-0"
                >
                  Back to Time
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px] focus:outline-none focus:ring-0">
                  {isSubmitting ? "Scheduling..." : "Schedule Call"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === "confirmation" && (
          <div className="space-y-6 text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Call Scheduled Successfully!</h3>
              <p className="text-muted-foreground">
                We've sent a calendar invitation to your email with all the details.
              </p>
            </div>

            <Card className="p-6 bg-gray-50 text-left">
              <h4 className="font-medium mb-4">Meeting Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>30 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meeting Type:</span>
                  <span>Video Call (Zoom link in email)</span>
                </div>
              </div>
            </Card>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• You'll receive a confirmation email shortly</p>
              <p>• A calendar invitation with the Zoom link will be sent</p>
              <p>• Need to reschedule? Reply to the confirmation email</p>
            </div>

            <Button onClick={resetModal} className="w-full focus:outline-none focus:ring-0">
              Schedule Another Call
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

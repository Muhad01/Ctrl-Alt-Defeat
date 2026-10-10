"use client"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Lindy is like a super-efficient assistant for my agency. It handles communications, renewals, and leads, freeing me to focus on personalized service. A true game-changer!",
      name: "Mark",
      title: "Independent agent",
    },
    {
      quote:
        "It understands our company better than we do. Lindy has insights into our operations that we never even considered, helping us optimize processes we didn't know needed improvement.",
      name: "Althea",
      title: "Founder, Spoudaios Insurance",
    },
    {
      quote:
        "Implementation was smooth, and the results were immediate. Our team productivity increased by 40% within the first month of using Lindy and the CRM.",
      name: "Emily",
      title: "Indeed",
    },
    {
      quote:
        "The CRM integration has transformed how we manage our client relationships. Lindy's AI insights help us understand our customers better and close deals faster.",
      name: "Sam",
      title: "Founder, Marketing agency",
    },
    {
      quote:
        "The CRM dashboard gives us a complete view of our client journey. We've reduced response times by 60% and increased client retention since implementing Lindy's CRM.",
      name: "Lisa",
      title: "COO, Grey Financial",
    },
  ]

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="py-20 bg-white overflow-hidden hidden md:block">
      <div className="max-w-[960px] mx-auto relative">
        {/* Gradient fade overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Container with hidden overflow */}
        <div className="overflow-hidden">
          {/* Scrolling testimonials */}
          <motion.div
            className="flex gap-6 items-center"
            animate={{
              x: [0, -2000],
            }}
            transition={{
              duration: 40,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ width: "fit-content" }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="min-w-[320px] max-w-[320px] sm:min-w-[400px] sm:max-w-[400px] h-[240px] sm:h-[280px] p-6 sm:p-8 bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow flex-shrink-0 flex flex-col"
              >
                <div className="text-center">
                  <blockquote className="text-sm sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6 leading-snug sm:leading-relaxed flex-1">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-center mt-auto">
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

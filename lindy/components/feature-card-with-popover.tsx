"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp } from "lucide-react"

interface FeatureCardWithPopoverProps {
  title: string
  description: string
  benefit: string
  accentColor?: string
}

export default function FeatureCardWithPopover({
  title,
  description,
  benefit,
  accentColor = "rgba(120, 120, 255, 0.9)",
}: FeatureCardWithPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  // Update popover position when card position changes
  useEffect(() => {
    const updatePosition = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        setPosition({
          top: rect.top + scrollTop,
          left: rect.left,
          width: rect.width,
        })
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [cardRef])

  return (
    <>
      <motion.div
        ref={cardRef}
        layout
        className="h-full"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <Card
          className={`h-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-6 transition-all duration-200 cursor-pointer hover:shadow-md relative z-10 ${
            isOpen ? "ring-2 ring-offset-2" : ""
          }`}
          style={{
            borderColor: isOpen ? accentColor : "",
            ringColor: isOpen ? accentColor : "",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-medium mb-3" style={{ color: isOpen ? accentColor : "inherit" }}>
              {title}
            </h3>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className={`h-6 w-6 flex items-center justify-center rounded-full ${
                isOpen ? "bg-gray-100 dark:bg-gray-800" : "bg-transparent"
              }`}
            >
              <ChevronUp className="h-4 w-4" />
            </motion.div>
          </div>
          <p className="text-base text-muted-foreground">{description}</p>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: `${position.top - 10}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 50,
              transformOrigin: "top center",
            }}
            className="pointer-events-none"
          >
            <div
              className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg p-5 mt-3 pointer-events-auto"
              style={{ borderColor: accentColor }}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    What it does
                  </h4>
                  <p className="text-base">{description}</p>
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    How it helps you
                  </h4>
                  <p className="text-base">{benefit}</p>
                </div>

                {/* Visual indicator showing which card this popover belongs to */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white dark:bg-gray-950 border-l border-t border-gray-200 dark:border-gray-800"
                  style={{ borderColor: accentColor }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

// First, update the interface to include a callback for question clicks and rename for clarity
interface SectionTransitionProps {
  children: ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
  suggestedQuestions?: Array<{
    question: string
    action?: string // Optional action identifier
  }>
  onQuestionClick?: (question: string, action?: string) => void
  blurBackground?: boolean // New prop for blur background
}

// Update the component parameters to include the new onQuestionClick prop
export default function SectionTransition({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 50,
  once = true,
  suggestedQuestions = [],
  onQuestionClick,
  blurBackground = false, // Default to false
}: SectionTransitionProps) {
  const initialProps = {
    opacity: 0,
    y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    x: direction === "left" ? distance : direction === "right" ? -distance : 0,
  }

  const animateProps = {
    opacity: 1,
    y: 0,
    x: 0,
  }

  const transitionProps = {
    delay,
    duration,
    ease: "easeOut",
  }

  return (
    <motion.div
      className={`${className} ${blurBackground ? "relative" : ""}`}
      initial={initialProps}
      whileInView={animateProps}
      viewport={{ once: once, amount: 0.5 }}
      transition={transitionProps}
    >
      {blurBackground && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0) 70%)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: -1,
          }}
          aria-hidden="true"
        />
      )}
      {children}

      {false && suggestedQuestions.length > 0 && (
        <motion.div
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.7,
            staggerChildren: 0.05,
            delayChildren: 0.8,
          }}
        >
          {suggestedQuestions.slice(0, 2).map((item, index) => (
            <motion.button
              key={index}
              className="text-left p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-300 ease-in-out focus:outline-none"
              onClick={() => onQuestionClick?.(item.question, item.action)}
              whileHover={{
                y: -0.5,
                transition: {
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1.0],
                },
              }}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.05 * index,
                ease: [0.25, 0.1, 0.25, 1.0],
              }}
            >
              <div className="font-medium text-sm">{item.question}</div>
              {item.action && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.action}</div>}
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface FeatureTransformCardProps {
  title: string
  description: string
  benefit: string
  accentColor?: string
}

export default function FeatureTransformCard({
  title,
  description,
  benefit,
  accentColor = "rgba(99, 102, 241, 0.8)",
}: FeatureTransformCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="relative bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer"
      style={{
        boxShadow: isExpanded ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" : "none",
        borderColor: isExpanded ? accentColor : "",
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Card Header - Always visible */}
      <motion.div
        layout="position"
        className="p-6"
        style={{
          backgroundColor: isExpanded ? `${accentColor.replace("0.8", "0.05")}` : "transparent",
        }}
      >
        <div className="flex justify-between items-start">
          <motion.h3
            layout="position"
            className="text-xl font-medium"
            style={{ color: isExpanded ? accentColor.replace("0.8", "1") : "inherit" }}
          >
            {title}
          </motion.h3>
          <motion.div
            layout="position"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-500"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>

        {/* Brief description - visible when collapsed */}
        {!isExpanded && (
          <motion.p initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-base text-muted-foreground mt-2">
            {description}
          </motion.p>
        )}
      </motion.div>

      {/* Expanded Content - only visible when expanded */}
      {isExpanded && (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="px-6 pb-6"
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                What it does
              </h4>
              <p className="mt-2">{description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                How it helps you
              </h4>
              <p className="mt-2">{benefit}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

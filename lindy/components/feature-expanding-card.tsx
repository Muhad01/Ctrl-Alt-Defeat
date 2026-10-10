"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureExpandingCardProps {
  title: string
  description: string
  benefit: string
  accentColor?: string
}

export default function FeatureExpandingCard({
  title,
  description,
  benefit,
  accentColor = "rgba(120, 120, 255, 0.5)",
}: FeatureExpandingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Card
        className={cn(
          "h-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 transition-all duration-300 overflow-hidden cursor-pointer",
          isExpanded ? "shadow-md" : "hover:shadow-sm hover:-translate-y-1",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div layout className="p-6 h-full flex flex-col">
          <motion.div layout className="flex items-start justify-between mb-4">
            <motion.h3 layout className="text-xl font-medium" style={{ color: isExpanded ? accentColor : "inherit" }}>
              {title}
            </motion.h3>
            <motion.div
              layout
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {!isExpanded ? (
              <motion.p
                layout
                key="description"
                className="text-base text-muted-foreground"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {description}
              </motion.p>
            ) : (
              <motion.div
                layout
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6 mt-2"
              >
                <motion.div layout className="space-y-3">
                  <motion.h4 layout className="text-base font-medium text-gray-700 dark:text-gray-300">
                    What it does:
                  </motion.h4>
                  <motion.p layout className="text-base text-muted-foreground">
                    {description}
                  </motion.p>
                </motion.div>
                <motion.div layout className="space-y-3">
                  <motion.h4 layout className="text-base font-medium text-gray-700 dark:text-gray-300">
                    How it helps you:
                  </motion.h4>
                  <motion.p layout className="text-base text-muted-foreground">
                    {benefit}
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Card>
    </motion.div>
  )
}

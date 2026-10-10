"use client"

import { type ReactNode, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureExpandableCardProps {
  icon: ReactNode
  title: string
  description: string
  benefit: string
  accentColor?: string
}

export default function FeatureExpandableCard({
  icon,
  title,
  description,
  benefit,
  accentColor = "rgba(120, 120, 255, 0.5)",
}: FeatureExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Card
        className={cn(
          "h-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 transition-all duration-300 overflow-hidden cursor-pointer",
          isExpanded ? "shadow-md" : "hover:shadow-sm",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
              >
                {icon}
              </div>
              <h3 className="text-lg font-medium">{title}</h3>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </div>

          <AnimatePresence>
            {!isExpanded ? (
              <motion.p
                key="description"
                className="text-sm text-muted-foreground"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {description}
              </motion.p>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">What it does:</h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">How it helps you:</h4>
                  <p className="text-sm text-muted-foreground">{benefit}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  )
}

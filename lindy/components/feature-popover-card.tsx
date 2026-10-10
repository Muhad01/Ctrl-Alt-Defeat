"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion } from "framer-motion"

interface FeaturePopoverCardProps {
  title: string
  description: string
  benefit: string
  accentColor?: string
}

export default function FeaturePopoverCard({
  title,
  description,
  benefit,
  accentColor = "rgba(120, 120, 255, 0.9)",
}: FeaturePopoverCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Card
            className="h-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-6 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1"
            onClick={() => setIsOpen(true)}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-medium mb-3" style={{ color: isOpen ? accentColor : "inherit" }}>
                {title}
              </h3>
              <p className="text-base text-muted-foreground">{description}</p>
            </div>
          </Card>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0 bg-white dark:bg-gray-950 shadow-lg border border-gray-100 dark:border-gray-800 rounded-lg"
          sideOffset={5}
          align="center"
          side="top"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: accentColor }}>
              {title}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What it does:</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How it helps you:</h4>
                <p className="text-sm text-muted-foreground">{benefit}</p>
              </div>
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>
    </motion.div>
  )
}

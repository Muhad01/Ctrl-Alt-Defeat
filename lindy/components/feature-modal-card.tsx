"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface FeatureModalCardProps {
  icon: ReactNode
  title: string
  description: string
  benefit: string
  accentColor?: string
}

export default function FeatureModalCard({
  icon,
  title,
  description,
  benefit,
  accentColor = "rgba(120, 120, 255, 0.5)",
}: FeatureModalCardProps) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Card
            className={cn(
              "h-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1",
            )}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}
                >
                  {icon}
                </div>
                <h3 className="text-lg font-medium">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-w-[85vw] mx-auto p-4 sm:p-6 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
              >
                {icon}
              </div>
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription>Learn more about this feature and how it benefits you</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">What it does:</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">How it helps you:</h4>
              <p className="text-sm text-muted-foreground">{benefit}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

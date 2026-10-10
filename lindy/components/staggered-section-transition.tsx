"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggeredSectionTransitionProps {
  children: React.ReactNode
  className?: string
}

const StaggeredSectionTransition = ({ children, className }: StaggeredSectionTransitionProps) => {
  // Animation for each child item
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4, // Slightly adjusted duration for a smoother feel
        ease: [0.25, 0.1, 0.25, 1.0], // Common easing curve for UI animations
      },
    },
  }

  // Container animation variants to stagger children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Delay between each child's animation
      },
    },
  }

  return (
    <motion.div
      className={cn(
        "max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4", // Default grid, can be overridden
        className,
      )}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible" // Animate when the component scrolls into view
      viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% is visible, once
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants} className="w-full h-full">
          {" "}
          {/* Ensure motion.div takes full space of grid cell */}
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default StaggeredSectionTransition

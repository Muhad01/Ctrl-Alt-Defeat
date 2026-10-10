"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function FuturisticBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-blue-50/30"></div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                           linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      ></div>

      {/* Horizontal line */}
      <motion.div
        className="absolute h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent w-full top-1/2"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
      ></motion.div>

      {/* Vertical line */}
      <motion.div
        className="absolute w-px bg-gradient-to-b from-transparent via-purple-400/20 to-transparent h-full left-1/2"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.7 }}
      ></motion.div>

      {/* Geometric shapes */}
      <div className="absolute inset-0">
        {/* Circle */}
        <motion.div
          className="absolute rounded-full border border-blue-200/20 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px]"
          style={{ left: "15%", top: "20%" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        ></motion.div>

        {/* Large ring */}
        <motion.div
          className="absolute rounded-full border border-blue-200/10 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px]"
          style={{ right: "10%", bottom: "10%" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        ></motion.div>

        {/* Square */}
        <motion.div
          className="absolute border border-purple-200/10 w-[20vw] h-[20vw] max-w-[300px] max-h-[300px]"
          style={{ right: "25%", top: "15%", transform: "rotate(45deg)" }}
          initial={{ scale: 0.8, opacity: 0, rotate: 35 }}
          animate={{ scale: 1, opacity: 1, rotate: 45 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
        ></motion.div>
      </div>

      {/* Floating dots */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/10"
            style={{
              width: `${Math.random() * 5 + 3}px`,
              height: `${Math.random() * 5 + 3}px`,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Accent pulse */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-r from-blue-100/5 to-purple-100/5"
        style={{ width: "40vw", height: "40vw", left: "30%", top: "30%" }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

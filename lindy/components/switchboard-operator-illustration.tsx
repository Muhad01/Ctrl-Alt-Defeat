"use client"

import { motion } from "framer-motion"

export default function SwitchboardOperatorIllustration({ className = "" }: { className?: string }) {
  // Animation variants for drawing the lines
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = i * 0.5
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
          opacity: { delay, duration: 0.01 },
        },
      }
    },
  }

  // Animation for the connection lines
  const connectionVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: [0, 1, 1, 0],
      opacity: [0, 1, 1, 0],
      transition: {
        pathLength: {
          repeat: Number.POSITIVE_INFINITY,
          duration: 3,
          times: [0, 0.4, 0.6, 1],
          ease: "easeInOut",
        },
        opacity: {
          repeat: Number.POSITIVE_INFINITY,
          duration: 3,
          times: [0, 0.4, 0.6, 1],
          ease: "easeInOut",
        },
      },
    },
  }

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 600 400"
        initial="hidden"
        animate="visible"
        className="stroke-black dark:stroke-white"
      >
        {/* Switchboard */}
        <motion.rect
          x="150"
          y="100"
          width="300"
          height="200"
          rx="5"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={0}
        />

        {/* Switchboard panel details */}
        <motion.line x1="200" y1="100" x2="200" y2="300" strokeWidth="2" variants={draw} custom={0.5} />
        <motion.line x1="250" y1="100" x2="250" y2="300" strokeWidth="2" variants={draw} custom={0.6} />
        <motion.line x1="300" y1="100" x2="300" y2="300" strokeWidth="2" variants={draw} custom={0.7} />
        <motion.line x1="350" y1="100" x2="350" y2="300" strokeWidth="2" variants={draw} custom={0.8} />
        <motion.line x1="400" y1="100" x2="400" y2="300" strokeWidth="2" variants={draw} custom={0.9} />

        {/* Horizontal lines for the switchboard */}
        <motion.line x1="150" y1="150" x2="450" y2="150" strokeWidth="2" variants={draw} custom={1} />
        <motion.line x1="150" y1="200" x2="450" y2="200" strokeWidth="2" variants={draw} custom={1.1} />
        <motion.line x1="150" y1="250" x2="450" y2="250" strokeWidth="2" variants={draw} custom={1.2} />

        {/* Connection jacks */}
        {[175, 225, 275, 325, 375, 425].map((x, i) => (
          <>
            <motion.circle
              key={`jack-top-${i}`}
              cx={x}
              cy="125"
              r="5"
              fill="transparent"
              strokeWidth="2"
              variants={draw}
              custom={1.3 + i * 0.1}
            />
            <motion.circle
              key={`jack-mid1-${i}`}
              cx={x}
              cy="175"
              r="5"
              fill="transparent"
              strokeWidth="2"
              variants={draw}
              custom={1.9 + i * 0.1}
            />
            <motion.circle
              key={`jack-mid2-${i}`}
              cx={x}
              cy="225"
              r="5"
              fill="transparent"
              strokeWidth="2"
              variants={draw}
              custom={2.5 + i * 0.1}
            />
            <motion.circle
              key={`jack-bottom-${i}`}
              cx={x}
              cy="275"
              r="5"
              fill="transparent"
              strokeWidth="2"
              variants={draw}
              custom={3.1 + i * 0.1}
            />
          </>
        ))}

        {/* Operator */}
        <motion.circle cx="300" cy="350" r="25" fill="transparent" strokeWidth="2" variants={draw} custom={3.7} />

        {/* Operator headset */}
        <motion.path d="M275 350 Q300 320 325 350" fill="transparent" strokeWidth="2" variants={draw} custom={3.8} />
        <motion.line x1="275" y1="350" x2="275" y2="365" strokeWidth="2" variants={draw} custom={3.9} />
        <motion.line x1="325" y1="350" x2="325" y2="365" strokeWidth="2" variants={draw} custom={4} />

        {/* Operator body */}
        <motion.path
          d="M300 375 L300 400 M280 400 L320 400"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={4.1}
        />

        {/* Operator arms connecting to switchboard */}
        <motion.path d="M300 380 Q250 350 225 275" fill="transparent" strokeWidth="2" variants={draw} custom={4.2} />
        <motion.path d="M300 380 Q350 350 375 225" fill="transparent" strokeWidth="2" variants={draw} custom={4.3} />

        {/* Animated connection lines */}
        <motion.path
          d="M175 125 C200 50 400 50 425 125"
          fill="transparent"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeDasharray="5,5"
          variants={connectionVariants}
        />
        <motion.path
          d="M175 175 C150 220 450 220 425 175"
          fill="transparent"
          stroke="#EC4899"
          strokeWidth="2"
          strokeDasharray="5,5"
          variants={connectionVariants}
          animate={{
            ...connectionVariants.visible,
            transition: {
              ...connectionVariants.visible.transition,
              delay: 1,
            },
          }}
        />
        <motion.path
          d="M175 225 C100 300 500 300 425 225"
          fill="transparent"
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="5,5"
          variants={connectionVariants}
          animate={{
            ...connectionVariants.visible,
            transition: {
              ...connectionVariants.visible.transition,
              delay: 2,
            },
          }}
        />

        {/* AI Agent Labels */}
        <motion.text
          x="100"
          y="125"
          fontSize="12"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 4.5 } },
          }}
        >
          GPT-4
        </motion.text>
        <motion.text
          x="100"
          y="175"
          fontSize="12"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 4.6 } },
          }}
        >
          Claude
        </motion.text>
        <motion.text
          x="100"
          y="225"
          fontSize="12"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 4.7 } },
          }}
        >
          Gemini
        </motion.text>
        <motion.text
          x="100"
          y="275"
          fontSize="12"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 4.8 } },
          }}
        >
          Llama
        </motion.text>

        <motion.text
          x="480"
          y="125"
          fontSize="12"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 4.9 } },
          }}
        >
          Summarize
        </motion.text>
        <motion.text
          x="480"
          y="175"
          fontSize="12"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5 } },
          }}
        >
          Generate
        </motion.text>
        <motion.text
          x="480"
          y="225"
          fontSize="12"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.1 } },
          }}
        >
          Analyze
        </motion.text>
        <motion.text
          x="480"
          y="275"
          fontSize="12"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.2 } },
          }}
        >
          Translate
        </motion.text>

        {/* Title */}
        <motion.text
          x="300"
          y="70"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.3 } },
          }}
        >
          Lindy: The AI Switchboard Operator
        </motion.text>
      </motion.svg>
    </div>
  )
}

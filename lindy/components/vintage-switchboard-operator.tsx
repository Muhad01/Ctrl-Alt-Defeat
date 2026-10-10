"use client"

import { motion } from "framer-motion"

export default function VintageSwitchboardOperator({ className = "" }: { className?: string }) {
  // Animation variants for drawing the lines
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = i * 0.3
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

  // Animation for the connection lines (patch cords)
  const connectionVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = i * 0.5 + 3
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring", duration: 1, bounce: 0 },
          opacity: { delay, duration: 0.5 },
        },
      }
    },
  }

  // Animation for the signal pulse through the cords
  const pulseVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = i * 0.5 + 4.5
      return {
        opacity: [0, 1, 0],
        pathLength: [0, 0.3, 0],
        transition: {
          opacity: {
            delay,
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
            times: [0, 0.5, 1],
            ease: "easeInOut",
          },
          pathLength: {
            delay,
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
            times: [0, 0.5, 1],
            ease: "easeInOut",
          },
        },
      }
    },
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        initial="hidden"
        animate="visible"
        className="stroke-black dark:stroke-white"
      >
        {/* Switchboard Cabinet */}
        <motion.rect
          x="200"
          y="100"
          width="400"
          height="350"
          rx="5"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={0}
        />

        {/* Switchboard Panel */}
        <motion.rect
          x="220"
          y="120"
          width="360"
          height="310"
          rx="3"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={0.3}
        />

        {/* Jack Fields - Vertical sections */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.rect
            key={`section-${i}`}
            x={250 + i * 50}
            y="140"
            width="40"
            height="270"
            rx="2"
            fill="transparent"
            strokeWidth="1"
            variants={draw}
            custom={0.5 + i * 0.1}
          />
        ))}

        {/* Jack holes - 10 rows x 6 columns */}
        {Array.from({ length: 10 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <motion.circle
              key={`jack-${row}-${col}`}
              cx={270 + col * 50}
              cy={160 + row * 25}
              r="3"
              fill="transparent"
              strokeWidth="1"
              variants={draw}
              custom={1 + (row * 6 + col) * 0.02}
            />
          )),
        )}

        {/* Operator's desk */}
        <motion.rect
          x="250"
          y="450"
          width="300"
          height="20"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={2}
        />

        {/* Operator's chair */}
        <motion.rect
          x="350"
          y="470"
          width="100"
          height="10"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={2.1}
        />
        <motion.line x1="360" y1="480" x2="360" y2="520" strokeWidth="2" variants={draw} custom={2.2} />
        <motion.line x1="440" y1="480" x2="440" y2="520" strokeWidth="2" variants={draw} custom={2.2} />

        {/* Operator figure */}
        {/* Head */}
        <motion.circle cx="400" cy="380" r="25" fill="transparent" strokeWidth="2" variants={draw} custom={2.3} />

        {/* Headset */}
        <motion.path d="M375 380 Q400 350 425 380" fill="transparent" strokeWidth="2" variants={draw} custom={2.4} />
        <motion.line x1="375" y1="380" x2="375" y2="390" strokeWidth="2" variants={draw} custom={2.5} />
        <motion.line x1="425" y1="380" x2="425" y2="390" strokeWidth="2" variants={draw} custom={2.5} />

        {/* Neck */}
        <motion.line x1="400" y1="405" x2="400" y2="420" strokeWidth="2" variants={draw} custom={2.6} />

        {/* Body */}
        <motion.path
          d="M370 420 C370 450 430 450 430 420"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={2.7}
        />

        {/* Arms */}
        <motion.path
          d="M370 425 C340 430 330 450 320 470"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={2.8}
        />
        <motion.path
          d="M430 425 C460 430 470 450 480 470"
          fill="transparent"
          strokeWidth="2"
          variants={draw}
          custom={2.9}
        />

        {/* Hands operating the switchboard */}
        <motion.circle cx="320" cy="470" r="5" fill="transparent" strokeWidth="2" variants={draw} custom={3} />
        <motion.circle cx="480" cy="470" r="5" fill="transparent" strokeWidth="2" variants={draw} custom={3} />

        {/* Patch cords connecting different jacks */}
        {/* These represent connections between AI models and tasks */}
        <motion.path
          d="M270 160 C200 200 200 300 270 310"
          fill="transparent"
          stroke="#3B82F6"
          strokeWidth="3"
          variants={connectionVariants}
          custom={0}
        />
        <motion.path
          d="M320 185 C250 220 250 320 370 335"
          fill="transparent"
          stroke="#EC4899"
          strokeWidth="3"
          variants={connectionVariants}
          custom={1}
        />
        <motion.path
          d="M370 210 C300 240 300 340 420 360"
          fill="transparent"
          stroke="#10B981"
          strokeWidth="3"
          variants={connectionVariants}
          custom={2}
        />
        <motion.path
          d="M420 235 C350 260 350 360 470 385"
          fill="transparent"
          stroke="#F59E0B"
          strokeWidth="3"
          variants={connectionVariants}
          custom={3}
        />

        {/* Signal pulses through the cords */}
        <motion.path
          d="M270 160 C200 200 200 300 270 310"
          fill="transparent"
          stroke="white"
          strokeWidth="5"
          variants={pulseVariants}
          custom={0}
        />
        <motion.path
          d="M320 185 C250 220 250 320 370 335"
          fill="transparent"
          stroke="white"
          strokeWidth="5"
          variants={pulseVariants}
          custom={1}
        />
        <motion.path
          d="M370 210 C300 240 300 340 420 360"
          fill="transparent"
          stroke="white"
          strokeWidth="5"
          variants={pulseVariants}
          custom={2}
        />
        <motion.path
          d="M420 235 C350 260 350 360 470 385"
          fill="transparent"
          stroke="white"
          strokeWidth="5"
          variants={pulseVariants}
          custom={3}
        />

        {/* Labels for AI models */}
        <motion.text
          x="150"
          y="160"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5 } },
          }}
        >
          GPT-4
        </motion.text>
        <motion.text
          x="150"
          y="185"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.1 } },
          }}
        >
          Claude
        </motion.text>
        <motion.text
          x="150"
          y="210"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.2 } },
          }}
        >
          Gemini
        </motion.text>
        <motion.text
          x="150"
          y="235"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.3 } },
          }}
        >
          Llama
        </motion.text>

        {/* Labels for tasks */}
        <motion.text
          x="520"
          y="310"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.4 } },
          }}
        >
          Summarize
        </motion.text>
        <motion.text
          x="520"
          y="335"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.5 } },
          }}
        >
          Generate
        </motion.text>
        <motion.text
          x="520"
          y="360"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.6 } },
          }}
        >
          Analyze
        </motion.text>
        <motion.text
          x="520"
          y="385"
          fontSize="14"
          fontWeight="500"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 5.7 } },
          }}
        >
          Translate
        </motion.text>

        {/* Title */}
        <motion.text
          x="400"
          y="70"
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          fill="currentColor"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 6 } },
          }}
        >
          Lindy: The AI Switchboard Operator
        </motion.text>
      </motion.svg>
    </div>
  )
}

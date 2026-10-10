"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define our AI models and tasks
const AI_MODELS = [
  {
    id: "gpt4",
    name: "GPT-4",
    color: "#3B82F6",
    description: "Advanced language model with strong reasoning capabilities",
  },
  {
    id: "claude",
    name: "Claude",
    color: "#EC4899",
    description: "Excels at thoughtful, nuanced conversations and content creation",
  },
  {
    id: "gemini",
    name: "Gemini",
    color: "#10B981",
    description: "Multimodal model with strong visual and language understanding",
  },
  { id: "llama", name: "Llama", color: "#F59E0B", description: "Open-source model with customizable parameters" },
]

const TASKS = [
  { id: "summarize", name: "Summarize", description: "Condense long content into key points" },
  { id: "generate", name: "Generate", description: "Create new content based on prompts" },
  { id: "analyze", name: "Analyze", description: "Extract insights and patterns from data" },
  { id: "translate", name: "Translate", description: "Convert content between languages" },
]

type Connection = {
  modelId: string
  taskId: string
  path: string
  active: boolean
}

export default function InteractiveSwitchboard({ className = "" }: { className?: string }) {
  // Track which model and task are currently selected
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  // Track all active connections
  const [connections, setConnections] = useState<Connection[]>([])

  // Track if the initial animation has completed
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false)

  // Reference to the SVG element for calculating coordinates
  const svgRef = useRef<SVGSVGElement>(null)

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

  // Animation for the signal pulse through the cords
  const pulseVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      opacity: [0, 1, 0],
      pathLength: [0, 0.3, 0],
      transition: {
        opacity: {
          repeat: Number.POSITIVE_INFINITY,
          duration: 1.5,
          times: [0, 0.5, 1],
          ease: "easeInOut",
        },
        pathLength: {
          repeat: Number.POSITIVE_INFINITY,
          duration: 1.5,
          times: [0, 0.5, 1],
          ease: "easeInOut",
        },
      },
    },
  }

  // Calculate connection path between model and task
  const calculateConnectionPath = (modelId: string, taskId: string): string => {
    const modelIndex = AI_MODELS.findIndex((m) => m.id === modelId)
    const taskIndex = TASKS.findIndex((t) => t.id === taskId)

    if (modelIndex === -1 || taskIndex === -1) return ""

    const startX = 270
    const startY = 160 + modelIndex * 25
    const endX = 470
    const endY = 310 + taskIndex * 25

    // Create a curved path between the two points
    return `M${startX} ${startY} C${startX - 70} ${startY + 40}, ${startX - 70} ${endY - 40}, ${endX} ${endY}`
  }

  // Handle clicking on a model jack
  const handleModelClick = (modelId: string) => {
    if (!initialAnimationComplete) return

    if (selectedModel === modelId) {
      // Deselect if already selected
      setSelectedModel(null)
    } else {
      // Select this model
      setSelectedModel(modelId)

      // If a task is already selected, create a connection
      if (selectedTask) {
        createConnection(modelId, selectedTask)
      }
    }
  }

  // Handle clicking on a task jack
  const handleTaskClick = (taskId: string) => {
    if (!initialAnimationComplete) return

    if (selectedTask === taskId) {
      // Deselect if already selected
      setSelectedTask(null)
    } else {
      // Select this task
      setSelectedTask(taskId)

      // If a model is already selected, create a connection
      if (selectedModel) {
        createConnection(selectedModel, taskId)
      }
    }
  }

  // Create a connection between a model and task
  const createConnection = (modelId: string, taskId: string) => {
    // Check if this connection already exists
    const existingConnection = connections.find((c) => c.modelId === modelId && c.taskId === taskId)

    if (existingConnection) {
      // Toggle the active state if it exists
      setConnections(
        connections.map((c) => (c.modelId === modelId && c.taskId === taskId ? { ...c, active: !c.active } : c)),
      )
    } else {
      // Create a new connection
      const path = calculateConnectionPath(modelId, taskId)
      setConnections([...connections, { modelId, taskId, path, active: true }])
    }

    // Reset selections
    setSelectedModel(null)
    setSelectedTask(null)
  }

  // Remove a connection
  const removeConnection = (modelId: string, taskId: string) => {
    setConnections(connections.filter((c) => !(c.modelId === modelId && c.taskId === taskId)))
  }

  // Set initial animation complete after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialAnimationComplete(true)
    }, 6000) // Adjust based on your animation duration

    return () => clearTimeout(timer)
  }, [])

  // Get model color by ID
  const getModelColor = (modelId: string): string => {
    return AI_MODELS.find((m) => m.id === modelId)?.color || "#000000"
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <TooltipProvider>
        <motion.svg
          ref={svgRef}
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

          {/* Jack holes - Background grid */}
          {Array.from({ length: 10 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <motion.circle
                key={`jack-bg-${row}-${col}`}
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

          {/* Interactive AI Model Jacks */}
          {AI_MODELS.map((model, index) => (
            <Tooltip key={`model-${model.id}`}>
              <TooltipTrigger asChild>
                <motion.circle
                  cx={270}
                  cy={160 + index * 25}
                  r="6"
                  fill={selectedModel === model.id ? model.color : "transparent"}
                  stroke={model.color}
                  strokeWidth="2"
                  variants={draw}
                  custom={3.1 + index * 0.1}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => handleModelClick(model.id)}
                  style={{ cursor: initialAnimationComplete ? "pointer" : "default" }}
                  role="button"
                  aria-label={`Select ${model.name} model`}
                  tabIndex={0}
                />
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="font-medium">{model.name}</p>
                <p className="text-xs text-muted-foreground">{model.description}</p>
                <p className="text-xs mt-1">
                  {initialAnimationComplete ? "Click to select" : "Animation in progress..."}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Interactive Task Jacks */}
          {TASKS.map((task, index) => (
            <Tooltip key={`task-${task.id}`}>
              <TooltipTrigger asChild>
                <motion.circle
                  cx={470}
                  cy={310 + index * 25}
                  r="6"
                  fill={selectedTask === task.id ? "#6366F1" : "transparent"}
                  stroke="#6366F1"
                  strokeWidth="2"
                  variants={draw}
                  custom={3.5 + index * 0.1}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => handleTaskClick(task.id)}
                  style={{ cursor: initialAnimationComplete ? "pointer" : "default" }}
                  role="button"
                  aria-label={`Select ${task.name} task`}
                  tabIndex={0}
                />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{task.name}</p>
                <p className="text-xs text-muted-foreground">{task.description}</p>
                <p className="text-xs mt-1">
                  {initialAnimationComplete ? "Click to select" : "Animation in progress..."}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Active Connections */}
          <AnimatePresence>
            {connections
              .filter((c) => c.active)
              .map((connection, index) => (
                <motion.g key={`connection-${connection.modelId}-${connection.taskId}`}>
                  {/* Connection Line */}
                  <motion.path
                    d={connection.path}
                    fill="transparent"
                    stroke={getModelColor(connection.modelId)}
                    strokeWidth="3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => removeConnection(connection.modelId, connection.taskId)}
                    style={{ cursor: "pointer" }}
                    role="button"
                    aria-label={`Remove connection between ${connection.modelId} and ${connection.taskId}`}
                  />

                  {/* Pulse Effect */}
                  <motion.path
                    d={connection.path}
                    fill="transparent"
                    stroke="white"
                    strokeWidth="5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      pathLength: [0, 0.3, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.5,
                      delay: index * 0.2,
                    }}
                  />
                </motion.g>
              ))}
          </AnimatePresence>

          {/* Labels for AI models */}
          {AI_MODELS.map((model, index) => (
            <motion.text
              key={`model-label-${model.id}`}
              x="150"
              y={160 + index * 25 + 5} // +5 for vertical centering
              fontSize="14"
              fontWeight="500"
              fill="currentColor"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { delay: 5 + index * 0.1 } },
              }}
            >
              {model.name}
            </motion.text>
          ))}

          {/* Labels for tasks */}
          {TASKS.map((task, index) => (
            <motion.text
              key={`task-label-${task.id}`}
              x="520"
              y={310 + index * 25 + 5} // +5 for vertical centering
              fontSize="14"
              fontWeight="500"
              fill="currentColor"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { delay: 5.4 + index * 0.1 } },
              }}
            >
              {task.name}
            </motion.text>
          ))}

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

          {/* Instructions */}
          <motion.text
            x="400"
            y="550"
            fontSize="14"
            textAnchor="middle"
            fill="currentColor"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 6.2 } },
            }}
          >
            Click on a model and a task to create a connection. Click on a connection to remove it.
          </motion.text>
        </motion.svg>
      </TooltipProvider>

      {/* Connection Status Panel */}
      <div className="mt-6 p-4 border rounded-md bg-white dark:bg-gray-950">
        <h3 className="text-lg font-medium mb-2">Active Connections</h3>
        {connections.filter((c) => c.active).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active connections. Click on a model and a task to connect them.
          </p>
        ) : (
          <ul className="space-y-2">
            {connections
              .filter((c) => c.active)
              .map((connection) => {
                const model = AI_MODELS.find((m) => m.id === connection.modelId)
                const task = TASKS.find((t) => t.id === connection.taskId)
                return (
                  <li
                    key={`status-${connection.modelId}-${connection.taskId}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getModelColor(connection.modelId) }}
                      />
                      <span className="text-sm">
                        {model?.name} → {task?.name}
                      </span>
                    </div>
                    <button
                      className="text-xs text-red-500 hover:text-red-700"
                      onClick={() => removeConnection(connection.modelId, connection.taskId)}
                    >
                      Remove
                    </button>
                  </li>
                )
              })}
          </ul>
        )}
      </div>
    </div>
  )
}

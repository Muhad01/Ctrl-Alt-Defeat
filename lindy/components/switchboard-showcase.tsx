"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import VintageSwitchboardOperator from "@/components/vintage-switchboard-operator"
import { motion } from "framer-motion"

export default function SwitchboardShowcase() {
  const [isRestarted, setIsRestarted] = useState(false)

  const handleRestart = () => {
    setIsRestarted(true)
    setTimeout(() => setIsRestarted(false), 100)
  }

  return (
    <section className="py-20 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium bg-white backdrop-blur-sm mb-2">
              <span className="text-primary">How Lindy Works</span>
            </div>
            <h2 className="text-3xl font-bold tracking-normal sm:text-4xl md:text-5xl mb-4">
              The AI Switchboard Operator
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Connecting you to the right AI for every task
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 md:p-10 max-w-4xl mx-auto shadow-md">
            <div className="flex flex-col items-center">
              {!isRestarted && <VintageSwitchboardOperator className="mb-8" />}

              <div className="max-w-2xl text-center">
                <p className="text-muted-foreground mb-8">
                  In the early days of telephone communication, switchboard operators manually connected callers by
                  plugging patch cords into the appropriate jacks. Similarly, Lindy acts as your AI switchboard
                  operator, intelligently routing your requests to the most appropriate AI models and tools based on the
                  task at hand.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleRestart} variant="outline" className="mx-auto">
                    Replay Animation
                  </Button>
                  <Button className="mx-auto">Learn How It Works</Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Intelligent Routing</h3>
            <p className="text-sm text-muted-foreground">
              Lindy analyzes your request and automatically selects the best AI model for the specific task, ensuring
              optimal results.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Seamless Connections</h3>
            <p className="text-sm text-muted-foreground">
              Connect to multiple AI capabilities without switching between different interfaces or learning new
              systems.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Unified Experience</h3>
            <p className="text-sm text-muted-foreground">
              Enjoy a consistent experience regardless of which AI models are working behind the scenes to fulfill your
              requests.
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

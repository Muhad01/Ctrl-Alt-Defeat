"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InteractiveSwitchboard from "@/components/interactive-switchboard"
import VintageSwitchboardOperator from "@/components/vintage-switchboard-operator"
import { motion } from "framer-motion"
import { Info, HelpCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function InteractiveSwitchboardDemo() {
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
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              The AI Switchboard
              <br />
              Operator
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
          <Card className="p-6 md:p-10 max-w-5xl mx-auto shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Switchboard Demonstration</h3>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>How It Works</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Understanding the AI Switchboard</DialogTitle>
                    <DialogDescription>
                      Just like telephone switchboard operators connected callers to recipients, Lindy connects your
                      requests to the most appropriate AI models.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="flex gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">1</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Select an AI Model</h4>
                        <p className="text-sm text-muted-foreground">
                          Click on one of the AI model connection points on the left side of the switchboard.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">2</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Select a Task</h4>
                        <p className="text-sm text-muted-foreground">
                          Click on one of the task connection points on the right side of the switchboard.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">3</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Watch the Connection</h4>
                        <p className="text-sm text-muted-foreground">
                          A connection line will appear, showing how Lindy routes your request to the appropriate AI
                          model.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">4</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Remove Connections</h4>
                        <p className="text-sm text-muted-foreground">
                          Click on any active connection line to remove it, or use the remove button in the Active
                          Connections panel.
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="interactive" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="interactive">Interactive Demo</TabsTrigger>
                <TabsTrigger value="animation">Animation</TabsTrigger>
              </TabsList>

              <TabsContent value="interactive" className="mt-0">
                <div className="flex flex-col items-center">
                  {!isRestarted && <InteractiveSwitchboard className="mb-4" />}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button onClick={handleRestart} variant="outline" className="mx-auto">
                      Reset Demo
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="animation" className="mt-0">
                <div className="flex flex-col items-center">
                  {!isRestarted && <VintageSwitchboardOperator className="mb-8" />}

                  <div className="max-w-2xl text-center">
                    <p className="text-muted-foreground mb-8">
                      In the early days of telephone communication, switchboard operators manually connected callers by
                      plugging patch cords into the appropriate jacks. Similarly, Lindy acts as your AI switchboard
                      operator, intelligently routing your requests to the most appropriate AI models and tools based on
                      the task at hand.
                    </p>

                    <Button onClick={handleRestart} variant="outline" className="mx-auto">
                      Replay Animation
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-medium">Intelligent Routing</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Lindy analyzes your request and automatically selects the best AI model for the specific task, ensuring
              optimal results.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-medium">Seamless Connections</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect to multiple AI capabilities without switching between different interfaces or learning new
              systems.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-medium">Unified Experience</h3>
            </div>
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

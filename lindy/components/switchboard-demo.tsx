"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import SwitchboardOperatorIllustration from "@/components/switchboard-operator-illustration"

export default function SwitchboardDemo() {
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium bg-white backdrop-blur-sm mb-2">
              <span className="text-primary">How Lindy Works</span>
            </div>
            <h2 className="text-3xl font-bold tracking-normal sm:text-4xl md:text-5xl mb-4">
              The AI Switchboard Operator
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Lindy connects you to the right AI agent for each task, just like a telephone switchboard operator.
            </p>
          </div>
        </div>

        <Card className="p-6 md:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <SwitchboardOperatorIllustration className="mb-8" />

            <div className="max-w-2xl text-center">
              <p className="text-muted-foreground mb-6">
                Just as switchboard operators once connected callers to the right recipients, Lindy intelligently routes
                your requests to the most appropriate AI models and tools. Whether you need summarization, content
                generation, data analysis, or translation, Lindy ensures you're always connected to the optimal AI agent
                for your specific task.
              </p>

              <Button onClick={() => setIsPlaying(!isPlaying)} variant="outline" className="mx-auto">
                {isPlaying ? "Pause Animation" : "Play Animation"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

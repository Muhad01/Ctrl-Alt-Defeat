"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Paperclip, Send } from "lucide-react"

export default function TypingPromptInput() {
  const desktopPrompts = [
    "Schedule a meeting for next Tuesday...",
    "Get a commercial insurance quote...",
    "Draft an email to clients...",
    "How many new clients this month...",
    "Optimize customer onboarding...",
  ]

  const mobilePrompts = [
    "Schedule meeting...",
    "Get a quote...",
    "Draft email...",
    "Check new clients...",
    "Optimize onboarding...",
  ]

  const quickActions = [
    { label: "Get a quote", action: "Get a business insurance quote for a new client" },
    { label: "Send an email", action: "Draft an email to our clients about our new offerings" },
    { label: "Update CRM", action: "Update client information in our CRM system" },
    { label: "How are sales?", action: "Show me our sales performance for this quarter" },
  ]

  const [displayText, setDisplayText] = useState("")
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Controls the typing speed
  const typingSpeed = 50 // milliseconds per character
  const deletingSpeed = 20 // milliseconds per character
  const pauseBeforeDelete = 2000 // pause before deleting
  const pauseBeforeNextPrompt = 500 // pause before typing next prompt

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const prompts = isMobile ? mobilePrompts : desktopPrompts

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isTyping) {
      // Typing animation
      if (currentCharIndex < prompts[currentPromptIndex].length) {
        timeout = setTimeout(() => {
          setDisplayText(prompts[currentPromptIndex].substring(0, currentCharIndex + 1))
          setCurrentCharIndex(currentCharIndex + 1)
        }, typingSpeed)
      } else {
        // Finished typing, pause before deleting
        timeout = setTimeout(() => {
          setIsTyping(false)
        }, pauseBeforeDelete)
      }
    } else {
      // Deleting animation
      if (currentCharIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(prompts[currentPromptIndex].substring(0, currentCharIndex - 1))
          setCurrentCharIndex(currentCharIndex - 1)
        }, deletingSpeed)
      } else {
        // Finished deleting, move to next prompt
        timeout = setTimeout(() => {
          setCurrentPromptIndex((currentPromptIndex + 1) % prompts.length)
          setIsTyping(true)
        }, pauseBeforeNextPrompt)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentCharIndex, currentPromptIndex, isTyping, prompts])

  const handleQuickAction = (action: string) => {
    setUserInput(action)
    setShowQuickActions(false)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Quick Actions */}
      {showQuickActions && (
        <div className="absolute bottom-full mb-2 w-64 left-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
          <div className="grid grid-cols-1 gap-1">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex items-center">
        <div className="flex items-center gap-1 px-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-[0.5rem] text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>
        <Input
          className="h-11 flex-grow border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 
        bg-transparent text-muted-foreground py-2 px-3 text-sm md:text-base"
          value={userInput || displayText}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <div className="flex items-center gap-1 px-2">
          <Button
            className="h-9 w-9 rounded-md bg-black hover:bg-gray-800 dark:bg-primary dark:hover:bg-primary/90 ml-1 hidden md:flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}

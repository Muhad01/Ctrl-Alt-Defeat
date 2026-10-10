"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()

  // Set theme to light and handle mounting
  useEffect(() => {
    setTheme("light")
    setMounted(true)
  }, [setTheme])

  if (!mounted) {
    return null
  }

  return null
}

"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ContactModal from "@/components/contact-modal"
import { motion, AnimatePresence } from "framer-motion"

export default function MainNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [showBackdrop, setShowBackdrop] = useState(false)
  const [isIncludesMobileOpen, setIsIncludesMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      setScrolled(isScrolled)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Set hasAnimated to true after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true)
    }, 2500) // After animation duration + delay

    return () => clearTimeout(timer)
  }, [])

  // Handle backdrop for mobile menu
  useEffect(() => {
    if (isOpen) {
      setShowBackdrop(true)
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden"
    } else {
      const timer = setTimeout(() => setShowBackdrop(false), 300)
      // Re-enable body scroll when menu is closed
      document.body.style.overflow = ""
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const mainNavItems = [
    { label: "About", href: "/about", hasDropdown: false },
    { label: "Pricing", href: "/pricing", hasDropdown: false },
    { label: "Integrations", href: "/integrations/overview", hasDropdown: false },
    {
      label: "Includes",
      href: "#",
      hasDropdown: true,
      dropdownItems: [
        { label: "Forms", href: "/forms" },
        { label: "Tasks", href: "/tasks" },
        { label: "Poe", href: "/poe" },
        { label: "Savings", href: "/savings" },
      ],
    },
    { label: "Custom", href: "/custom", hasDropdown: false },
    { label: "Demo", href: "/demo", hasDropdown: false },
  ]

  const handleScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && href !== "#") {
      e.preventDefault()
      const id = href.substring(1)
      const element = document.getElementById(id)
      if (element) {
        setIsOpen(false)
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
        window.history.pushState({}, "", href)
      }
    } else if (href === "#") {
      // Do nothing for dropdown triggers
    } else {
      setIsOpen(false)
    }
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3,
        delay: 0.2,
      },
    },
  }

  const logoVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3,
      },
    },
    bounce: {
      scale: [1, 1.05, 1],
      rotate: [0, -2, 2, -1, 1, 0],
      transition: {
        duration: 1.2,
        delay: 0.8,
        ease: "easeInOut",
      },
    },
  }

  // Mobile menu animation variants
  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out border-b border-gray-100 dark:border-gray-800 ${
        scrolled
          ? "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg shadow-sm border-gray-200 dark:border-gray-700 h-14"
          : "bg-white dark:bg-gray-950 h-16"
      }`}
    >
      <div
        className={`container flex items-center justify-between transition-all duration-300 ease-out px-0 sm:px-4 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center space-x-2 group transition-all duration-300 ease-out hover:opacity-90 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 pt-1"
            aria-label="My Lindy Homepage"
          >
            <motion.div
              initial="hidden"
              animate={hasAnimated ? "visible" : ["visible", "bounce"]}
              variants={containerVariants}
              className="relative"
            >
              <motion.div variants={logoVariants} className="relative scale-75 md:scale-90">
                <img
                  src="/lindy-button-logo.png"
                  alt="My Lindy"
                  className={`transition-all duration-300 ease-out ${scrolled ? "h-9" : "h-10"}`}
                />
              </motion.div>
            </motion.div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item, index) =>
              item.hasDropdown ? (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0 text-muted-foreground"
                    >
                      {item.label} <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 shadow-none">
                    {item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
                      <DropdownMenuItem key={dropdownIndex} asChild>
                        <Link
                          href={dropdownItem.href}
                          className="w-full"
                          onClick={(e) => handleScroll(e, dropdownItem.href)}
                        >
                          {dropdownItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  key={index}
                  variant="ghost"
                  asChild
                  className="text-sm font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0"
                >
                  <Link
                    href={item.href}
                    className="px-3 py-1 hover:px-3 hover:py-1"
                    onClick={(e) => handleScroll(e, item.href)}
                  >
                    {item.label}
                  </Link>
                </Button>
              ),
            )}

            {/* Contact Modal Trigger */}
            <ContactModal>
              <Button
                variant="ghost"
                className="text-sm font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-1"
              >
                Contact
              </Button>
            </ContactModal>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-sm font-medium focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border border-gray-200 hover:border-gray-300"
            >
              <Link href="https://app.mylindy.com" target="_blank" rel="noopener noreferrer">
                Login
              </Link>
            </Button>

            <ThemeToggle />

            <Button
              asChild
              size="sm"
              className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Link href="https://app.mylindy.com/auth" target="_blank" rel="noopener noreferrer">
                Sign up
              </Link>
            </Button>
          </div>

          {/* Mobile menu backdrop */}
          <AnimatePresence>
            {showBackdrop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsOpen(false)}
              />
            )}
          </AnimatePresence>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 relative z-50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 ease-in-out rounded-md mobile-menu-button"
                aria-label="Open Menu"
              >
                <div className="relative w-6 h-5 flex flex-col justify-center items-center">
                  <span
                    className={`block absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                      isOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
                    }`}
                  />
                  <span
                    className={`block absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                      isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                    }`}
                  />
                  <span
                    className={`block absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                      isOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
                    }`}
                  />
                </div>
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-[400px] border-l border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900"
            >
              <nav className="flex flex-col gap-2 pt-8" aria-label="Mobile Navigation">
                <AnimatePresence>
                  {isOpen && (
                    <div className="pb-4">
                      {(() => {
                        let motionIndex = 0
                        return mainNavItems.flatMap((item) => {
                          if (item.hasDropdown && item.label === "Includes") {
                            // Target "Includes" specifically
                            const includesHeader = (
                              <motion.div
                                key={`${item.label}-header`}
                                custom={motionIndex++} // motionIndex for the header
                                variants={menuItemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                              >
                                <button
                                  className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-left transition-colors duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                  onClick={() => setIsIncludesMobileOpen(!isIncludesMobileOpen)}
                                  aria-expanded={isIncludesMobileOpen}
                                  aria-controls={`includes-mobile-submenu`}
                                >
                                  <span>{item.label}</span> {/* Apply mobile-menu-link styling if needed, or inherit */}
                                  <ChevronDown
                                    className={`h-5 w-5 transition-transform duration-200 text-muted-foreground group-hover:text-foreground ${
                                      isIncludesMobileOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                              </motion.div>
                            )

                            // The children items will be inside AnimatePresence, so they don't need individual motion.divs here
                            // if AnimatePresence handles their container.
                            // However, for staggered animation, each item *does* need its own motion.div.
                            // Let's keep individual motion.divs for items for consistency with original stagger.

                            const includesChildrenElements =
                              isIncludesMobileOpen &&
                              item.dropdownItems?.map((dropdownItem) => (
                                <motion.div
                                  key={dropdownItem.href}
                                  custom={motionIndex++} // motionIndex for each dropdown item
                                  variants={menuItemVariants} // Use the same variants for consistency
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit" // This exit might need to be coordinated with the AnimatePresence wrapper's exit
                                >
                                  <Link
                                    href={dropdownItem.href}
                                    className="block py-3 text-base font-medium transition-all duration-300 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md hover:translate-x-0.5 mobile-menu-link pl-8 pr-4" // Indented
                                    onClick={(e) => {
                                      handleScroll(e, dropdownItem.href)
                                      // setIsOpen(false); // Close entire sheet on nav
                                    }}
                                  >
                                    {dropdownItem.label}
                                  </Link>
                                </motion.div>
                              ))

                            return [
                              includesHeader,
                              <AnimatePresence key={`${item.label}-submenu-wrapper`}>
                                {isIncludesMobileOpen && (
                                  <motion.div
                                    id="includes-mobile-submenu"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="flex flex-col pl-0" // Children will have their own pl-8
                                  >
                                    {/* The motion.divs for children are now generated in includesChildrenElements */}
                                    {includesChildrenElements}
                                  </motion.div>
                                )}
                              </AnimatePresence>,
                            ]
                          }
                          return (
                            <motion.div
                              key={item.href}
                              custom={motionIndex++}
                              variants={menuItemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <Link
                                href={item.href}
                                className="block px-4 py-3 text-base font-medium transition-all duration-300 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md hover:translate-x-0.5 mobile-menu-link"
                                onClick={(e) => handleScroll(e, item.href)}
                              >
                                {item.label}
                              </Link>
                            </motion.div>
                          )
                        })
                      })()}

                      {/* Contact Modal for Mobile */}
                      <motion.div
                        custom={mainNavItems.reduce((acc, item) => acc + (item.dropdownItems?.length || 1), 0)}
                        variants={menuItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <ContactModal>
                          <button className="w-full text-left px-4 py-3 text-base font-medium transition-all duration-300 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md hover:translate-x-0.5 mobile-menu-link">
                            Contact
                          </button>
                        </ContactModal>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center px-4">
                    <ThemeToggle />
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <>
                        <motion.div
                          custom={mainNavItems.reduce((acc, item) => acc + (item.dropdownItems?.length || 1), 0) + 1}
                          variants={menuItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Button
                            asChild
                            variant="outline"
                            className="mx-4 w-[calc(100%-2rem)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          >
                            <Link
                              href="https://app.mylindy.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                            >
                              Login
                            </Link>
                          </Button>
                        </motion.div>

                        <motion.div
                          custom={mainNavItems.reduce((acc, item) => acc + (item.dropdownItems?.length || 1), 0) + 2}
                          variants={menuItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Button
                            asChild
                            className="mx-4 w-[calc(100%-2rem)] bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          >
                            <Link
                              href="https://app.mylindy.com/auth"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                            >
                              Sign up
                            </Link>
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

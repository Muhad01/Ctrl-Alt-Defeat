"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#insurers", label: "Insurers" },
  { href: "#procedures", label: "Procedures" },
  { href: "#faq", label: "FAQ" },
];

/** Sticky header that condenses into frosted glass after the first 20px of scroll (template behaviour). */
export default function Navbar() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled((was) => (y > 20) !== was ? y > 20 : was));

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${scrolled ? "border-gray-200/80 bg-white/85 shadow-soft backdrop-blur-lg" : "border-transparent bg-transparent"}`}>
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 sm:px-6 ${scrolled ? "h-14" : "h-16"}`}>
        <Link href="/" aria-label="AuthProof home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="btn-primary btn-sm px-3">
            Open the demo
          </Link>
        </div>
        <button className="btn-ghost btn-sm md:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50">
                  {l.label}
                </a>
              ))}
              <Link href="/login" className="btn-primary mt-2">
                Open the demo
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import CriteriaChecklist from "@/components/CriteriaChecklist";
import { ReadinessGauge } from "@/components/Insights";
import { DEMO } from "./demoData";

/** Same chart, two insurers: switching the retrieved policy flips K2 and the readiness score. */
export default function InsurerSwitch() {
  const [key, setKey] = useState("blueriver");
  const reduce = useReducedMotion();
  const d = DEMO[key];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lift">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-ink">Hamza Qureshi, 47M. Right knee MRI</div>
          <div className="text-xs text-gray-500">Synthetic patient. 4 weeks of physiotherapy documented.</div>
        </div>
        <div role="tablist" aria-label="Insurer policy" className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {Object.entries(DEMO).map(([k, v]) => (
            <button
              key={k}
              role="tab"
              aria-selected={key === k}
              onClick={() => setKey(k)}
              className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition ${key === k ? "text-ink" : "text-gray-500 hover:text-ink"}`}
            >
              {key === k && <motion.span layoutId="insurer-pill" className="absolute inset-0 rounded-md bg-white shadow-soft" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{v.payer}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_220px]">
        <AnimatePresence mode="wait">
          <motion.div key={key} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="min-w-0">
            <CriteriaChecklist criteria={d.criteria} policy={d.policy} />
          </motion.div>
        </AnimatePresence>
        <div className="flex flex-col items-center justify-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 md:sticky md:top-20 md:self-start">
          <ReadinessGauge readiness={d.readiness} />
          <p className="text-center text-xs leading-relaxed text-gray-500">
            {d.payer} {d.rule}. Same chart, same code. Only the retrieved policy changed.
          </p>
        </div>
      </div>
    </div>
  );
}

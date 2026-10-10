"use client";
import { motion, useReducedMotion } from "motion/react";

/** Fades content up as it enters the viewport (the template's SectionTransition). Static under reduced motion. */
export default function Reveal({ children, className = "", delay = 0, y = 24, as = "div", amount = 0.3 }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

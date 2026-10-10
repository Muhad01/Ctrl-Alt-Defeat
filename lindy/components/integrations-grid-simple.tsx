"use client"

import { motion } from "framer-motion"
import SectionTransition from "@/components/section-transition"
import Image from "next/image"
import Link from "next/link"

export default function IntegrationsGridSimple() {
  return (
    <section className="py-8 bg-white">
      {/* New image added below the main container div */}
      <div className="mt-8 flex justify-center">
        <Image
          src="/My lindy AI Insurance integrations (2).svg"
          alt="My Lindy AI Insurance Integrations"
          width={1000}
          height={600}
          className="w-full max-w-4xl h-auto object-contain"
          unoptimized
        />
      </div>
      {/* The original section content, now moved below the image */}
      <div className="container px-4 md:px-6 max-w-[960px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
        {" "}
        {/* Added mt-8 for spacing */}
        <SectionTransition className="text-center max-w-3xl mx-auto mb-8">
          <h3 className="text-2xl font-medium mb-4">Connect with 100+ apps and services</h3>
          <p className="text-muted-foreground">
            Lindy integrates with all your favorite tools, CRMs, and custom APIs to create a seamless workflow. We help
            with setup and personalized automations to ensure everything works perfectly for your business.
          </p>
          <div className="mt-4">
            {" "}
            {/* Added div wrapper and margin-top */}
            <Link href="/integrations/overview" className="text-primary hover:underline">
              Explore all our integrations.
            </Link>
          </div>
        </SectionTransition>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto"
        ></motion.div>
      </div>
    </section>
  )
}

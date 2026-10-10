"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import SectionTransition from "@/components/section-transition"
import Image from "next/image"

export default function IntegrationsGrid() {
  // Define integration categories and their items
  const integrationCategories = [
    {
      name: "Communication",
      items: [
        { name: "Gmail", icon: "/logos/integrations/gmail.svg" },
        { name: "Outlook", icon: "/placeholder.svg?width=24&height=24" },
        { name: "Slack", icon: "/logos/integrations/slack-icon.png" },
        { name: "Teams", icon: "/placeholder.svg?width=24&height=24" },
      ],
    },
    {
      name: "Productivity",
      items: [
        { name: "Google Drive", icon: "/placeholder.svg?width=24&height=24" },
        { name: "Dropbox", icon: "/placeholder.svg?width=24&height=24" },
        { name: "Notion", icon: "/placeholder.svg?width=24&height=24" },
        { name: "Asana", icon: "/placeholder.svg?width=24&height=24" },
      ],
    },
    {
      name: "CRM & Sales",
      items: [
        { name: "Salesforce", icon: "/placeholder.svg?width=24&height=24" },
        { name: "HubSpot", icon: "/placeholder.svg?width=24&height=24" },
        { name: "Pipedrive", icon: "/placeholder.svg?width=24&height=24" },
        { name: "Zoho", icon: "/placeholder.svg?width=24&height=24" },
      ],
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6 max-w-[960px]">
        <div className="flex justify-center mb-12">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Div%20%5Bframer-1d8vbmy%5D-vfjVJiWLoWCXc6gU6OCBoNtv0D3rxZ.svg"
            alt="Integrations Grid"
            width={800}
            height={400}
            className="max-w-full"
          />
        </div>

        <SectionTransition className="text-center max-w-3xl mx-auto mb-12">
          <h3 className="text-2xl font-medium mb-4">Connect with 100+ apps and services</h3>
          <p className="text-muted-foreground">
            Lindy integrates with all your favorite tools to create a seamless workflow
          </p>
        </SectionTransition>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {integrationCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full">
                <h4 className="text-lg font-medium mb-4">{category.name}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        {/* Placeholder for actual icons */}
                        <span className="text-xs">{item.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

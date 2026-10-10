"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserRound, Phone, Mail, Building, MoreHorizontal, Plus } from "lucide-react"

// Define prospect type
type Prospect = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  value: string
  status: "lead" | "negotiation" | "closed"
}

// Sample prospect data
const initialProspects: Prospect[] = [
  {
    id: "p1",
    name: "Sarah Johnson",
    company: "Acme Corp",
    email: "sarah@acmecorp.com",
    phone: "(555) 123-4567",
    value: "$12,500",
    status: "lead",
  },
  {
    id: "p2",
    name: "Michael Chen",
    company: "TechGrowth Inc",
    email: "mchen@techgrowth.co",
    phone: "(555) 987-6543",
    value: "$28,000",
    status: "lead",
  },
  {
    id: "p3",
    name: "Jessica Williams",
    company: "Bright Solutions",
    email: "jwilliams@brightsolutions.io",
    phone: "(555) 456-7890",
    value: "$9,800",
    status: "negotiation",
  },
  {
    id: "p4",
    name: "David Rodriguez",
    company: "Global Services",
    email: "drodriguez@globalservices.com",
    phone: "(555) 234-5678",
    value: "$45,000",
    status: "negotiation",
  },
  {
    id: "p5",
    name: "Emma Thompson",
    company: "Innovate Partners",
    email: "ethompson@innovate.co",
    phone: "(555) 876-5432",
    value: "$32,500",
    status: "closed",
  },
  {
    id: "p6",
    name: "Robert Kim",
    company: "Nexus Enterprises",
    email: "rkim@nexusent.com",
    phone: "(555) 345-6789",
    value: "$18,750",
    status: "closed",
  },
]

export default function CrmKanbanSection() {
  // State for prospects in each column
  const [leads, setLeads] = useState(initialProspects.filter((p) => p.status === "lead"))
  const [negotiations, setNegotiations] = useState(initialProspects.filter((p) => p.status === "negotiation"))
  const [closed, setClosed] = useState(initialProspects.filter((p) => p.status === "closed"))

  // Handle moving a prospect between columns
  const moveProspect = (id: string, from: string, to: string) => {
    let prospect: Prospect | undefined

    // Remove from source column
    if (from === "lead") {
      prospect = leads.find((p) => p.id === id)
      setLeads(leads.filter((p) => p.id !== id))
    } else if (from === "negotiation") {
      prospect = negotiations.find((p) => p.id === id)
      setNegotiations(negotiations.filter((p) => p.id !== id))
    } else if (from === "closed") {
      prospect = closed.find((p) => p.id === id)
      setClosed(closed.filter((p) => p.id !== id))
    }

    if (!prospect) return

    // Update status
    prospect.status = to as "lead" | "negotiation" | "closed"

    // Add to target column
    if (to === "lead") {
      setLeads([...leads, prospect])
    } else if (to === "negotiation") {
      setNegotiations([...negotiations, prospect])
    } else if (to === "closed") {
      setClosed([...closed, prospect])
    }
  }

  return (
    <section className="py-24 bg-white" id="crm-feature">
      <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium bg-white backdrop-blur-sm mb-4">
            <span className="text-primary">Built-in CRM</span>
          </div>
          <h2 className="text-3xl font-bold tracking-normal sm:text-4xl md:text-5xl mb-4">
            Manage prospects with ease
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Lindy knows all about your prospects and clients with just a 5-minute setup. Drag and drop to move prospects
            through your sales pipeline.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium">Sales Pipeline</h3>
            <button className="flex items-center gap-1 text-sm font-medium text-primary">
              <Plus size={16} />
              Add Prospect
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leads Column */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h4 className="font-medium flex items-center justify-between">
                  <span>Leads</span>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{leads.length}</span>
                </h4>
              </div>
              <div className="p-3 min-h-[400px]">
                <AnimatePresence>
                  {leads.map((prospect) => (
                    <motion.div
                      key={prospect.id}
                      layoutId={prospect.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-move shadow-sm hover:shadow-md transition-all"
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDragEnd={(e, info) => {
                        // Check if dragged far enough to the right
                        if (info.offset.x > 100) {
                          moveProspect(prospect.id, "lead", "negotiation")
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-700 p-1.5 rounded-full">
                            <UserRound size={16} />
                          </div>
                          <h5 className="font-medium">{prospect.name}</h5>
                        </div>
                        <span className="text-sm font-medium text-green-600">{prospect.value}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                        <Building size={14} />
                        <span>{prospect.company}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{prospect.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          <span>{prospect.phone}</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Negotiation Column */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h4 className="font-medium flex items-center justify-between">
                  <span>In Negotiation</span>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {negotiations.length}
                  </span>
                </h4>
              </div>
              <div className="p-3 min-h-[400px]">
                <AnimatePresence>
                  {negotiations.map((prospect) => (
                    <motion.div
                      key={prospect.id}
                      layoutId={prospect.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-move shadow-sm hover:shadow-md transition-all"
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDragEnd={(e, info) => {
                        // Check if dragged far enough to the left or right
                        if (info.offset.x < -100) {
                          moveProspect(prospect.id, "negotiation", "lead")
                        } else if (info.offset.x > 100) {
                          moveProspect(prospect.id, "negotiation", "closed")
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 text-purple-700 p-1.5 rounded-full">
                            <UserRound size={16} />
                          </div>
                          <h5 className="font-medium">{prospect.name}</h5>
                        </div>
                        <span className="text-sm font-medium text-green-600">{prospect.value}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                        <Building size={14} />
                        <span>{prospect.company}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{prospect.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          <span>{prospect.phone}</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Closed Column */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h4 className="font-medium flex items-center justify-between">
                  <span>Closed Won</span>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{closed.length}</span>
                </h4>
              </div>
              <div className="p-3 min-h-[400px]">
                <AnimatePresence>
                  {closed.map((prospect) => (
                    <motion.div
                      key={prospect.id}
                      layoutId={prospect.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-move shadow-sm hover:shadow-md transition-all"
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDragEnd={(e, info) => {
                        // Check if dragged far enough to the left
                        if (info.offset.x < -100) {
                          moveProspect(prospect.id, "closed", "negotiation")
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 text-green-700 p-1.5 rounded-full">
                            <UserRound size={16} />
                          </div>
                          <h5 className="font-medium">{prospect.name}</h5>
                        </div>
                        <span className="text-sm font-medium text-green-600">{prospect.value}</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                        <Building size={14} />
                        <span>{prospect.company}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail size={12} />
                          <span>{prospect.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={12} />
                          <span>{prospect.phone}</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Drag prospect cards to move them between stages. Lindy automatically updates contact records and can send
            follow-up emails.
          </div>
        </div>
      </div>
    </section>
  )
}

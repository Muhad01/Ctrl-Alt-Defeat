"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, MessageSquare, TrendingUp, Shield, Database, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import SectionTransition from "@/components/section-transition"
import { useState } from "react"

const industries = [
  {
    id: "insurance",
    name: "Insurance Agencies",
    description: "Streamline policy management and client relationships",
    icon: Shield,
    color: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    features: [
      {
        title: "Prospect Management",
        description: "Track leads through customizable pipeline stages (new, contacted, qualified, converted)",
        icon: Users,
      },
      {
        title: "Client Database",
        description: "Manage existing clients with detailed profiles, policy information, and communication history",
        icon: Database,
      },
      {
        title: "Document Processing",
        description: "AI-powered analysis of insurance documents, policy papers, and claims",
        icon: FileText,
      },
      {
        title: "Automated Follow-ups",
        description: "Generate personalized SMS messages based on client profiles and interaction history",
        icon: MessageSquare,
      },
    ],
    benefits: [
      "Reduce policy processing time by 70%",
      "Improve client retention with automated touchpoints",
      "Ensure compliance with organized document storage",
      "Track claims and policy renewals effortlessly",
    ],
  },
  {
    id: "financial",
    name: "Financial Services",
    description: "Enhance client relationships and ensure compliance",
    icon: TrendingUp,
    color: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    features: [
      {
        title: "Client Relationship Management",
        description: "Comprehensive profiles with financial data, meeting history, and document storage",
        icon: Users,
      },
      {
        title: "Document Analysis",
        description: "AI processing of financial statements, contracts, and regulatory documents",
        icon: FileText,
      },
      {
        title: "Compliance Tracking",
        description: "Organized document storage with search capabilities for audits",
        icon: Shield,
      },
      {
        title: "Communication Automation",
        description: "Personalized outreach based on client financial profiles",
        icon: MessageSquare,
      },
    ],
    benefits: [
      "Reduce reporting time by up to 70%",
      "Maintain regulatory compliance with ease",
      "Personalize client communications at scale",
      "Identify market opportunities faster",
    ],
  },
  {
    id: "business",
    name: "Business Owners",
    description: "Centralize operations and accelerate growth",
    icon: Zap,
    color: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    features: [
      {
        title: "Lead Management",
        description: "Track prospects from initial contact through conversion",
        icon: Users,
      },
      {
        title: "Team Collaboration",
        description: "Multi-user access with role-based permissions",
        icon: Users,
      },
      {
        title: "Document Organization",
        description: "Centralized storage and AI-powered search of business documents",
        icon: Database,
      },
      {
        title: "Integration Hub",
        description: "Connect with external tools and services for workflow automation",
        icon: Zap,
      },
    ],
    benefits: [
      "Save 10+ hours per week on administrative tasks",
      "Improve team coordination and productivity",
      "Never lose track of important documents",
      "Scale operations without adding complexity",
    ],
  },
  {
    id: "marketing",
    name: "Marketing Companies",
    description: "Optimize campaigns and maximize conversions",
    icon: TrendingUp,
    color: "rgba(236, 72, 153, 0.1)",
    borderColor: "rgba(236, 72, 153, 0.3)",
    features: [
      {
        title: "Campaign Management",
        description: "Track leads and prospects from different marketing channels",
        icon: TrendingUp,
      },
      {
        title: "Client Communication",
        description: "Automated, personalized messaging based on prospect data",
        icon: MessageSquare,
      },
      {
        title: "Performance Analytics",
        description: "Track conversion rates and lead quality by source",
        icon: TrendingUp,
      },
      {
        title: "Form Builder",
        description: "Create landing page forms and lead capture tools",
        icon: FileText,
      },
    ],
    benefits: [
      "Increase conversion rates by up to 40%",
      "Automate lead nurturing workflows",
      "Track ROI across all marketing channels",
      "Deliver personalized experiences at scale",
    ],
  },
]

export default function IndustrySolutions() {
  const [selectedIndustry, setSelectedIndustry] = useState("insurance")
  const selected = industries.find((ind) => ind.id === selectedIndustry)!

  return (
    <section className="relative py-32 overflow-hidden" id="industry-solutions">
      <div className="absolute inset-0 overflow-hidden">
        {/* Base layer with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), 
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <SectionTransition>
          <motion.div
            className="text-center max-w-3xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium bg-white/80 backdrop-blur-sm mb-6 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent font-semibold">
                Industry Solutions
              </span>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Tailored for Your Industry
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Lindy adapts to your specific business needs with industry-focused features and workflows
            </motion.p>
          </motion.div>
        </SectionTransition>

        {/* Industry Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {industries.map((industry, index) => {
            const Icon = industry.icon
            return (
              <motion.button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                  selectedIndustry === industry.id
                    ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{industry.name}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Selected Industry Content */}
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Features */}
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-8 text-gray-900">Key Features for {selected.name}</h3>
              <div className="space-y-4">
                {selected.features.map((feature, index) => {
                  const FeatureIcon = feature.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="p-6 border hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        style={{
                          borderColor: "rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                              <FeatureIcon className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-8 text-gray-900">Benefits & Results</h3>
              <Card className="p-8 bg-white border shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="space-y-4 mb-8">
                  {selected.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{benefit}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    Join thousands of {selected.name.toLowerCase()} already using Lindy to transform their operations
                  </p>
                  <Button className="w-full group">
                    Get Started for {selected.name}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>

              {/* Testimonial Preview */}
              <Card className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200 shadow-sm">
                <p className="text-sm italic text-gray-600 mb-3">
                  "Lindy has completely transformed how we manage our{" "}
                  {selected.id === "insurance"
                    ? "policies"
                    : selected.id === "financial"
                      ? "client portfolios"
                      : selected.id === "marketing"
                        ? "campaigns"
                        : "operations"}
                  . The AI-powered features save us hours every week."
                </p>
                <p className="text-sm font-semibold">
                  —{" "}
                  {selected.id === "insurance"
                    ? "Sarah Chen, Insurance Agency Owner"
                    : selected.id === "financial"
                      ? "Michael Roberts, Financial Advisor"
                      : selected.id === "marketing"
                        ? "Jessica Lee, Marketing Director"
                        : "David Kim, Business Owner"}
                </p>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

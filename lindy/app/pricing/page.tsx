"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SectionTransition from "@/components/section-transition"
import StaggeredSectionTransition from "@/components/staggered-section-transition"
import ContactModal from "@/components/contact-modal"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Check, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Testimonials from "@/components/testimonials"
import BookDemoModal from "@/components/book-demo-modal"
import Link from "next/link"
import Image from "next/image"

const dialogStyles = `
.dialog-close-button {
border: 0px !important;
outline: none !important;
}

[data-radix-dialog-content] button[aria-label="Close"] {
border: 0px !important;
outline: none !important;
}

[data-radix-dialog-content] button[aria-label="Close"]:focus {
border: 0px !important;
outline: none !important;
box-shadow: none !important;
}

[data-radix-dialog-content] button[aria-label="Close"]:focus-visible {
border: 0px !important;
outline: none !important;
box-shadow: none !important;
}

/* Hide pricing page headings when modal is open */
body:has([data-state="open"]) #pricing-heading,
body:has([data-state="open"]) #pricing-heading + * {
display: none !important;
}

body:has([data-state="open"]) .pricing-section-header {
display: none !important;
}
`

export default function PricingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dialogStyles }} />
      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white" aria-labelledby="pricing-heading">
        <div className="container px-4 md:px:6">
          <SectionTransition className="flex flex-col items-center text-center mb-12 pricing-section-header">
            <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide">Pricing</p>
            <h2 id="pricing-heading" className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              Simple pricing
            </h2>
          </SectionTransition>

          <StaggeredSectionTransition className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Single User Plan */}
            <div className="bg-white rounded-lg border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold mb-2">Single User</h3>

              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">$179</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-start">
                  <p className="text-sm">1 user account</p>
                </div>
                <div className="flex items-start gap-2">
                  <p className="text-sm">AI-powered CRM</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">AI that knows your business</h4>
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-3">
                              Comes pre-integrated with OpenAI, Grok, Claude, and a proprietary assistant that deeply
                              understands your business's workflows, documents, and client relationships.
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              This AI knows your clients, your pipeline, your documents, and your business processes
                              better than most human team members.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              It can draft emails, generate summaries, answer client questions, handle objections, and
                              provide real-time insights.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Core CRM Features</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">AI-Driven Prospect Pipeline</p>
                                <p className="text-xs text-muted-foreground">
                                  Drag-and-drop visual interface with auto-updates and smart filtering
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Smart Forms & Custom Fields</p>
                                <p className="text-xs text-muted-foreground">
                                  Automated lead creation from intake forms with direct CRM integration
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Communication Automation</p>
                                <p className="text-xs text-muted-foreground">
                                  AI-personalized email and SMS templates with triggered follow-ups
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Document-Linked Profiles</p>
                                <p className="text-xs text-muted-foreground">
                                  Fully searchable client records with linked documents and audit trails
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Team Collaboration</p>
                                <p className="text-xs text-muted-foreground">
                                  Multi-user system with role-based access and shared dashboards
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Built-In Reporting & Insights</p>
                                <p className="text-xs text-muted-foreground">
                                  Track conversions, performance, and campaign effectiveness
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-start gap-2">
                  <p className="text-sm">Integrations included</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">LLM Models</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">OpenAI Models</p>
                                <p className="text-xs text-muted-foreground">GPT-4o, GPT-4, GPT-3.5 Turbo</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Anthropic Claude</p>
                                <p className="text-xs text-muted-foreground">Claude 3 Opus, Sonnet, Haiku</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Grok Models</p>
                                <p className="text-xs text-muted-foreground">Grok-1, Grok-1.5, Grok-2</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Standard Integrations</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Email & Calendar</p>
                                <p className="text-xs text-muted-foreground">
                                  Gmail, Google Calendar, Outlook, Microsoft 365, Calendly
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Automation</p>
                                <p className="text-xs text-muted-foreground">Zapier, Webhooks, Custom APIs</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">CRM & Sales</p>
                                <p className="text-xs text-muted-foreground">
                                  Salesforce, other basic integrations via API/webhooks
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Insurance Management</p>
                                <p className="text-xs text-muted-foreground">
                                  NowCerts, AgencyZoom, Hawksoft, EzLynx, Edison
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">E-commerce</p>
                                <p className="text-xs text-muted-foreground">Basic integrations via API/webhooks</p>
                              </div>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                <AlertCircle className="h-3 w-3 mr-1" /> Limited
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Accounting</p>
                                <p className="text-xs text-muted-foreground">Basic integrations via API/webhooks</p>
                              </div>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                <AlertCircle className="h-3 w-3 mr-1" /> Limited
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Specialized AI Integrations</h4>
                          <div className="space-y-4">
                            <div className="p-4 bg-white border rounded-lg flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Poe</h5>
                                <p className="text-xs text-muted-foreground">
                                  An AI assistant integration that uses OpenAI's models for content creation, article
                                  writing, and general chat assistance.
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-4 bg-white border rounded-lg flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Poe Send</h5>
                                <p className="text-xs text-muted-foreground">
                                  Webhook integration for sending content to external services.
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-4 bg-white border rounded-lg flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-sm mb-2">ElevenLabs</h5>
                                <p className="text-xs text-muted-foreground">
                                  AI-powered text-to-speech and voice generation.
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-white border border-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>API & Webhook Access:</strong> All integrations with API and webhook connections are
                            available. CRM/Sales integrations are included in this plan. Need custom integrations or
                            specialized features? Contact us to have us build a custom AI agent with your exact
                            workflow.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start">
                  <p className="text-sm">OpenAI, Anthropic, Grok</p>
                </div>
                <div className="flex items-start gap-2">
                  <Link
                    href="/forms"
                    className="text-sm text-foreground underline hover:text-primary hover:opacity-75 transition-all duration-200"
                  >
                    Lindy forms
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">What Lindy Forms Do</h4>
                          <div className="p-4 bg-gray-50 border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Create dynamic, mobile-friendly web forms that capture and validate client data in real
                              time, convert responses into structured records, automate follow-up actions, and integrate
                              with internal tools and external platforms via webhooks.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">How They Work</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Build Forms Easily</p>
                              <p className="text-xs text-muted-foreground">
                                Use a drag-and-drop interface to create custom forms with text, dropdowns, file uploads,
                                checkboxes, and more. No coding required.
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Embed or Share Anywhere</p>
                              <p className="text-xs text-muted-foreground">
                                Add forms to websites, landing pages, emails, or share standalone links.
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Intake and Process Data</p>
                              <p className="text-xs text-muted-foreground">
                                Form submissions are validated, stored, and converted to structured records in your CRM
                                or client database. Uploaded documents are automatically processed and analyzed.
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Automate Workflow</p>
                              <p className="text-xs text-muted-foreground">
                                Assign submissions to team members based on rules. Trigger SMS/email follow-ups,
                                schedule tasks, or send alerts via Slack/Teams.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Real-World Use Cases</h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-medium text-sm mb-2">Insurance</h5>
                              <div className="grid gap-2">
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Quote Request Form</p>
                                  <p className="text-xs text-muted-foreground">
                                    Capture key client and risk data for auto, home, or business quotes
                                  </p>
                                </div>
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Policy Review Intake</p>
                                  <p className="text-xs text-muted-foreground">
                                    Allow clients to upload current insurance documents for comparison and analysis
                                  </p>
                                </div>
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Claims Reporting Form</p>
                                  <p className="text-xs text-muted-foreground">
                                    Collect incident details and documentation to start the claims process immediately
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm mb-2">Financial Services</h5>
                              <div className="grid gap-2">
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Client Intake Questionnaire</p>
                                  <p className="text-xs text-muted-foreground">
                                    Collect information on income, assets, liabilities, goals, and risk preferences
                                  </p>
                                </div>
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Document Submission for Compliance</p>
                                  <p className="text-xs text-muted-foreground">
                                    Receive KYC/AML documentation securely (ID, bank statements, tax forms)
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm mb-2">Small Businesses</h5>
                              <div className="grid gap-2">
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Service Request Form</p>
                                  <p className="text-xs text-muted-foreground">
                                    Enable prospects to specify what services they're interested in
                                  </p>
                                </div>
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Project Onboarding Form</p>
                                  <p className="text-xs text-muted-foreground">
                                    Collect scope, timeline, goals, and contact info at the start of client engagement
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start gap-2">
                  <p className="text-sm">Knowledge base</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">What is the Knowledge Base?</h4>
                          <div className="p-3 bg-gray-50 border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              The knowledge base is a shared, AI-accessible memory that powers every tool on the
                              platform—Lindy, Gmail, Zapier, and more.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">How it works:</h4>
                          <div className="p-3 bg-white border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Automatically captures info from chats, documents, and integrations. Organizes and stores
                              policies, procedures, client details, and business data. Feeds relevant context to AI
                              agents in real time.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Benefits to users:</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Keep track of internal processes, carrier rules, and documentation
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Speed up onboarding and training with centralized, searchable knowledge
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                AI gives faster, smarter answers using your business's own information
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Create consistency across client communication, quotes, and forms
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Save time and avoid repetition—AI remembers key details for you
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-white border border-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>In short:</strong> the knowledge base helps your team work faster, stay aligned, and
                            scale with confidence.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <a href="https://app.mylindy.com/auth" target="_blank" rel="noopener noreferrer">
                <Button className="w-full rounded-[0.5rem] bg-[#1a1d21] hover:bg-[#2a2d31] text-white">
                  Get Started
                </Button>
              </a>
            </div>

            {/* Team Plan */}
            <div className="bg-white rounded-lg border-2 border-primary p-8 shadow-md flex flex-col relative">
              <h3 className="text-xl font-bold mb-2">Team</h3>

              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">$349</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-start gap-2">
                  <p className="text-sm">Up to 10 user accounts</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-w-[85vw] p-4 sm:p-6 bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-4 py-4 bg-white">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Additional Users:</strong> $25 per user per month for each user beyond the included
                            10 users.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Need more than 10 users? Simply add additional team members at $25/month each. All
                            additional users get full access to the same features and capabilities as your core team.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start gap-2">
                  <p className="text-sm">AI-powered CRM</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">
                            Built-In AI Agents That Know Your Business
                          </h4>
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-3">
                              Comes pre-integrated with OpenAI, Grok, Claude, and a proprietary assistant that deeply
                              understands your business's workflows, documents, and client relationships.
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              This AI knows your clients, your pipeline, your documents, and your business processes
                              better than most human team members.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              It can draft emails, generate summaries, answer client questions, handle objections, and
                              provide real-time insights.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Core CRM Features</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">AI-Driven Prospect Pipeline</p>
                                <p className="text-xs text-muted-foreground">
                                  Drag-and-drop visual interface with auto-updates and smart filtering
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Smart Forms & Custom Fields</p>
                                <p className="text-xs text-muted-foreground">
                                  Automated lead creation from intake forms with direct CRM
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Communication Automation</p>
                                <p className="text-xs text-muted-foreground">
                                  AI-personalized email and SMS templates with triggered follow-ups
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Document-Linked Profiles</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Team Collaboration</p>
                                <p className="text-xs text-muted-foreground">
                                  Multi-user system with role-based access and shared dashboards
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Built-In Reporting & Insights</p>
                                <p className="text-xs text-muted-foreground">
                                  Track conversions, performance, and campaign effectiveness
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-start gap-2">
                  <p className="text-sm">Integrations included</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">LLM Models</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">OpenAI Models</p>
                                <p className="text-xs text-muted-foreground">GPT-4o, GPT-4, GPT-3.5 Turbo</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Anthropic Claude</p>
                                <p className="text-xs text-muted-foreground">Claude 3 Opus, Sonnet, Haiku</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Grok Models</p>
                                <p className="text-xs text-muted-foreground">Grok-1, Grok-1.5, Grok-2</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Standard Integrations</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Email & Calendar</p>
                                <p className="text-xs text-muted-foreground">
                                  Gmail, Google Calendar, Outlook, Microsoft 365, Calendly
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Communication</p>
                                <p className="text-xs text-muted-foreground">Zoom, Slack, Microsoft Teams</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Project Management</p>
                                <p className="text-xs text-muted-foreground">Available via webhooks and API</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Automation</p>
                                <p className="text-xs text-muted-foreground">Zapier, Webhooks, Custom APIs</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">CRM & Sales</p>
                                <p className="text-xs text-muted-foreground">Salesforce, HubSpot, Pipedrive</p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Insurance Management</p>
                                <p className="text-xs text-muted-foreground">
                                  NowCerts, AgencyZoom, Hawksoft, EzLynx, Edison
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Specialized AI Integrations</h4>
                          <div className="space-y-4">
                            <div className="p-4 bg-white border rounded-lg flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Poe</h5>
                                <p className="text-xs text-muted-foreground">
                                  An AI assistant integration that uses OpenAI's models for content creation, article
                                  writing, and general chat assistance.
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-4 bg-white border rounded-lg flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Poe Send</h5>
                                <p className="text-xs text-muted-foreground">
                                  Webhook integration for sending content to external services.
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-4 bg-white border rounded-lg flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-sm mb-2">ACORD Me Not</h5>
                                <p className="text-xs text-muted-foreground">
                                  Specialized insurance document parser that extracts data from policies and generates
                                  ACORD forms in under 2 minutes.
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                            <div className="p-4 bg-white border rounded-lg flex items-start justify-between">
                              <div>
                                <h5 className="font-medium text-sm mb-2">ElevenLabs</h5>
                                <p className="text-xs text-muted-foreground">
                                  AI-powered text-to-speech and voice generation.
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                <Check className="h-3 w-3 mr-1" /> Included
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start">
                  <p className="text-sm">OpenAI, Anthropic, Grok</p>
                </div>
                <div className="flex items-start gap-2">
                  <Link
                    href="/forms"
                    className="text-sm text-foreground underline hover:text-primary hover:opacity-75 transition-all duration-200"
                  >
                    Lindy forms
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">What Lindy Forms Do</h4>
                          <div className="p-4 bg-gray-50 border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Create dynamic, mobile-friendly web forms that capture and validate client data in real
                              time, convert responses into structured records, automate follow-up actions, and integrate
                              with internal tools and external platforms via webhooks.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">How They Work</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Build Forms Easily</p>
                              <p className="text-xs text-muted-foreground">
                                Use a drag-and-drop interface to create custom forms with text, dropdowns, file uploads,
                                checkboxes, and more. No coding required.
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Embed or Share Anywhere</p>
                              <p className="text-xs text-muted-foreground">
                                Add forms to websites, landing pages, emails, or share standalone links.
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Intake and Process Data</p>
                              <p className="text-xs text-muted-foreground">
                                Form submissions are validated, stored, and converted to structured records in your CRM
                                or client database. Uploaded documents are automatically processed and analyzed.
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Automate Workflow</p>
                              <p className="text-xs text-muted-foreground">
                                Assign submissions to team members based on rules. Trigger SMS/email follow-ups,
                                schedule tasks, or send alerts via Slack/Teams.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Real-World Use Cases</h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-medium text-sm mb-2">Insurance</h5>
                              <div className="grid gap-2">
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Quote Request Form</p>
                                  <p className="text-xs text-muted-foreground">
                                    Capture key client and risk data for auto, home, or business quotes
                                  </p>
                                </div>
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Policy Review Intake</p>
                                  <p className="text-xs text-muted-foreground">
                                    Allow clients to upload current insurance documents for comparison and analysis
                                  </p>
                                </div>
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Claims Reporting Form</p>
                                  <p className="text-xs text-muted-foreground">
                                    Collect incident details and documentation to start the claims process immediately
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm mb-2">Financial Services</h5>
                              <div className="grid gap-2">
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Client Intake Questionnaire</p>
                                  <p className="text-xs text-muted-foreground">
                                    Collect information on income, assets, liabilities, goals, and risk preferences
                                  </p>
                                </div>
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Document Submission for Compliance</p>
                                  <p className="text-xs text-muted-foreground">
                                    Receive KYC/AML documentation securely (ID, bank statements, tax forms)
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm mb-2">Small Businesses</h5>
                              <div className="grid gap-2">
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Service Request Form</p>
                                  <p className="text-xs text-muted-foreground">
                                    Enable prospects to specify what services they're interested in
                                  </p>
                                </div>
                                <div className="p-2 bg-white border rounded-lg">
                                  <p className="text-xs font-medium">Project Onboarding Form</p>
                                  <p className="text-xs text-muted-foreground">
                                    Collect scope, timeline, goals, and contact info at the start of client engagement
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start gap-2">
                  <p className="text-sm">Knowledge base</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">What is the Knowledge Base?</h4>
                          <div className="p-3 bg-gray-50 border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              The knowledge base is a shared, AI-accessible memory that powers every tool on the
                              platform—Lindy, Gmail, Zapier, and more.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">How it works:</h4>
                          <div className="p-3 bg-white border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Automatically captures info from chats, documents, and integrations. Organizes and stores
                              policies, procedures, client details, and business data. Feeds relevant context to AI
                              agents in real time.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Benefits to users:</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Keep track of internal processes, carrier rules, and documentation
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Speed up onboarding and training with centralized, searchable knowledge
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                AI gives faster, smarter answers using your business's own information
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Create consistency across client communication, quotes, and forms
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Save time and avoid repetition—AI remembers key details for you
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-white border border-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>In short:</strong> the knowledge base helps your team work faster, stay aligned, and
                            scale with confidence.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <a href="https://app.mylindy.com/auth" target="_blank" rel="noopener noreferrer">
                <Button className="w-full rounded-[0.5rem] bg-primary hover:bg-primary/90 text-white">
                  Get Started
                </Button>
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold mb-2">Platinum</h3>

              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold" id="dynamic-price">
                  $500
                </span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>

              {/* Task Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tasks: <span className="font-bold">10</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  defaultValue="10"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: "#000000",
                  }}
                  onChange={(e) => {
                    const tasks = Number.parseInt(e.target.value)
                    const price = Math.round((tasks / 10) * 500)
                    const label = e.target.previousElementSibling
                    const priceDisplay = e.target.nextElementSibling
                    const mainPrice = document.getElementById("dynamic-price")
                    label.innerHTML = `Number of Tasks: <span class="font-bold">${tasks}</span>`
                    priceDisplay.textContent = `$${price}/month`
                    if (mainPrice) mainPrice.textContent = `$${price}`
                  }}
                />
                <div className="text-center text-sm font-semibold text-primary mt-2">$500/month</div>
              </div>

              <div className="space-y-4 mb-6 flex-grow">
                <div className="flex items-start gap-2">
                  <p className="text-sm">Auto workflows</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">What is a Workflow?</h4>
                          <div className="p-4 bg-gray-50 border rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              A workflow is a series of automated tasks that our AI agent performs on your behalf, just
                              like having a dedicated virtual assistant who never sleeps. Each workflow runs
                              automatically on a schedule you set, completing tasks without any input from you, and
                              you'll receive email notifications each time a task is completed.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">
                            Example: NOC (Notice of Cancellation) Workflow
                          </h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Daily NOC Retrieval</p>
                                <p className="text-xs text-muted-foreground">
                                  AI agent automatically retrieves your Notice of Cancellation once per
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                1 Task/mo
                              </Badge>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Weekly NOC Retrieval</p>
                                <p className="text-xs text-muted-foreground">
                                  AI agent automatically retrieves your Notice of Cancellation once per week
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                4 Tasks/mo
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">More Workflow Examples</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Client Follow-up Workflow</p>
                              <p className="text-xs text-muted-foreground">
                                Automatically send personalized follow-up emails to prospects who haven't responded in 7
                                days
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Policy Renewal Reminders</p>
                              <p className="text-xs text-muted-foreground">
                                Monitor client policies and automatically send renewal reminders 30, 15, and 7 days
                                before expiration
                              </p>
                            </div>
                            <div className="p-3 bg-white border rounded-lg">
                              <p className="text-sm font-medium mb-1">Lead Qualification</p>
                              <p className="text-xs text-muted-foreground">
                                Automatically qualify new leads from your website forms and route them to the
                                appropriate team member
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Better Than a Virtual Assistant</h4>
                          <div className="grid gap-3">
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Cost Comparison</p>
                                <p className="text-xs text-muted-foreground">
                                  Virtual assistants cost $1,200-2,500/month. Our AI workflows start at $500/month for
                                  10 tasks.
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">24/7 Availability</p>
                                <p className="text-xs text-muted-foreground">
                                  Unlike human VAs, our AI never sleeps, takes breaks, or calls in sick. Tasks run
                                  exactly when scheduled.
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Zero Management</p>
                                <p className="text-xs text-muted-foreground">
                                  No training, managing, or micromanaging required. Set it once and let it run
                                  automatically.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Stay Informed, Stay Off Your Computer</h4>
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Email Notifications:</strong> You'll receive a detailed email each time a task is
                              completed, including what was done, any results or findings, and next steps if applicable.
                              This keeps you informed and confident that work is being done on your behalf without
                              requiring you to check in or manage the process.
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start">
                  <p className="text-sm">No computer work required</p>
                </div>
                <div className="flex items-start gap-2">
                  <p className="text-sm">
                    Includes{" "}
                    <Link href="/owen" className="text-primary underline">
                      AI agent Owen
                    </Link>
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Plus className="h-3 w-3" />
                        Open
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-w-[85vw] p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-white rounded-[0.5rem] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg border">
                      <div className="space-y-6 bg-white pt-6">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-3">
                            Owen isn’t just automation. He’s an AI-powered teammate who sees what’s on your screen and
                            does the work—just like a human would. Only faster. And all day, every day.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Powered by Claude Vision, Owen is built to handle real-world web tasks across industries.
                            Whether you're in insurance, e-commerce, logistics, finance, or customer support, Owen helps
                            you reclaim time by taking on repetitive web-based work automatically.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">What Owen Can Do for You</h4>
                          <div className="space-y-3 p-3 bg-white border border-gray-200 rounded-lg mt-2">
                            <div>
                              <h5 className="font-medium text-md mb-1">Visual Web Automation</h5>
                              <p className="text-xs text-muted-foreground mb-2">
                                Owen doesn’t rely on brittle code or scripts. He sees websites the way a person
                                does—buttons, forms, menus, and content—and interacts with them intelligently.
                              </p>
                              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                <li>Clicks buttons</li>
                                <li>Fills out forms</li>
                                <li>Navigates websites</li>
                                <li>Downloads files</li>
                                <li>Extracts visible data</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-md mb-1">Smart Workflow Execution</h5>
                              <p className="text-xs text-muted-foreground">
                                Owen performs multi-step processes across platforms. If you need to log in, pull data,
                                sort it, and upload it somewhere else, he can do that from start to finish.
                              </p>
                            </div>
                            <div>
                              <h5 className="font-medium text-md mb-1">Scheduled Operations</h5>
                              <p className="text-xs text-muted-foreground">
                                You can schedule Owen to run tasks hourly, daily, or weekly. He works on your timeline,
                                even when you're offline.
                              </p>
                            </div>
                            <div>
                              <h5 className="font-medium text-md mb-1">Screenshot Analysis</h5>
                              <p className="text-xs text-muted-foreground">
                                Owen can read what's on the screen. He captures snapshots, understands what’s there, and
                                makes decisions based on what he sees—not just what’s behind the scenes in code.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg text-left">Why Teams Choose Owen</h4>
                          <div className="p-3 bg-white border border-gray-200 rounded-lg mt-2">
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                              <li>
                                <strong>Save Time:</strong> Automate the busywork that normally takes hours—logging into
                                sites, navigating dashboards, copying and pasting information.
                              </li>
                              <li>
                                <strong>Built for Multiple Industries:</strong> Owen helps:
                                <ul className="list-disc list-inside ml-4 text-xs space-y-1 mt-1">
                                  <li>E-commerce teams manage pricing, product listings, and inventory</li>
                                  <li>Logistics teams track shipments, update carrier sites, and manage bookings</li>
                                  <li>Finance teams pull reports, reconcile records, and monitor accounts</li>
                                  <li>Insurance teams track claims, pull policy data, and monitor rate changes</li>
                                  <li>
                                    Customer service teams gather client info, verify accounts, and support faster
                                    responses
                                  </li>
                                </ul>
                              </li>
                              <li>
                                <strong>Runs 24/7:</strong> Owen doesn’t need breaks. He checks data, runs updates, and
                                keeps operations moving around the clock.
                              </li>
                              <li>
                                <strong>Stays Resilient:</strong> Most automations break when a web page changes. Owen
                                adapts by seeing what’s actually on screen, not just relying on code.
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg text-left">Let Owen Handle the Repetitive Work</h4>
                          <div className="p-3 bg-white border border-gray-200 rounded-lg mt-2">
                            <p className="text-sm text-muted-foreground">
                              He sees. He clicks. He thinks. He acts. Owen turns everyday web tasks into quiet
                              background operations. So your team can focus on the work that moves things forward.
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-start">
                  <p className="text-sm">Everything that comes with Team</p>
                </div>
              </div>

              <ContactModal>
                <Button className="w-full rounded-[0.5rem] border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground">
                  Get Custom Quote
                </Button>
              </ContactModal>
            </div>
          </StaggeredSectionTransition>
          {/* Support and Training Notice */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-xs sm:text-sm font-medium text-green-800">
                Support and training comes with all packages
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        id="custom-ai-agents"
        className="py-16 bg-white dark:bg-background"
        aria-labelledby="custom-ai-agents-heading"
      >
        <div className="container px-4 md:px:6">
          <SectionTransition className="flex flex-col items-center text-center mb-12">
            <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide">Custom agents</p>
            <h2 id="custom-ai-agents-heading" className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
              Custom agents
            </h2>
          </SectionTransition>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:max-w-[860px] mx-auto">
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex flex-col items-center text-center mb-2">
                  <Image
                    src="/Edison ai rater for commercial insurance (2).svg" // Updated src
                    alt="Edison AI Insurance Rater"
                    width={128}
                    height={128}
                    className="object-contain mb-4"
                  />
                  <CardTitle className="text-xl text-left self-start">Custom insurance rater</CardTitle>
                </div>
                <CardDescription>
                  Custom-built AI for accurate home, auto, and commercial insurance rating for your state or area.
                  Streamline your quoting process.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex gap-2 mb-3"></div>
              </CardContent>
              <CardFooter>{/* Content removed */}</CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex flex-col items-center text-center mb-2">
                  <Image
                    src="/ai stock and finance ai agent with mylindy.com.svg"
                    alt="Market agent"
                    width={160}
                    height={160}
                    className="object-contain mb-4"
                  />
                  <CardTitle className="text-xl text-left self-start">Market agent</CardTitle>
                </div>
                <CardDescription>
                  Your personalized AI for market analysis, trend prediction, and investment insights. (For
                  informational purposes only).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex gap-2 mb-3"></div>
              </CardContent>
              <CardFooter>{/* Content removed */}</CardFooter>
            </Card>
            <Card className="flex flex-col bg-white rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <div className="flex flex-col items-center text-center mb-2">
                  <Image
                    src="/workflow-new.svg"
                    alt="AI Workflow Automation"
                    width={128}
                    height={128}
                    className="object-contain mb-4 opacity-100"
                  />
                  <CardTitle className="text-xl text-left self-start">Workflow automation</CardTitle>
                </div>
                <CardDescription>
                  Replace manual tasks and VAs with custom AI-driven workflows. We build automations unique to your
                  business operations.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex gap-2 mb-3"></div>
              </CardContent>
              <CardFooter>{/* Content removed */}</CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex flex-col items-center text-center mb-2">
                  <Image
                    src="/ai-caller-agent.svg"
                    alt="AI Caller Agent"
                    width={128}
                    height={128}
                    className="object-contain mb-4"
                  />
                  <CardTitle className="text-xl text-left self-start">AI caller</CardTitle>
                </div>
                <CardDescription>
                  AI-powered agent for handling inbound and outbound calls to prospects and clients, 24/7.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex gap-2 mb-3"></div>
              </CardContent>
              <CardFooter>{/* Content removed */}</CardFooter>
            </Card>

            <Card className="flex flex-col bg-white border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">Custom agents</CardTitle>
                </div>
                <CardDescription>
                  Need something specific? We build custom AI agents for your unique business needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Tell us your requirements and we'll create a tailored AI solution.
                </p>
              </CardContent>
              <CardFooter>
                <ContactModal>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Discuss Your Needs
                  </Button>
                </ContactModal>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      <Testimonials />
      <BookDemoModal />
    </>
  )
}

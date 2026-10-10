"use client"

import SectionTransition from "@/components/section-transition"
import MainNavbar from "@/components/main-navbar"
import Footer from "@/components/footer"
import StructuredData from "@/components/structured-data"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import BookDemoModal from "@/components/book-demo-modal"
import { useState } from "react"

export default function DemoPage() {
  const [selectedVideo, setSelectedVideo] = useState(null)

  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
        <MainNavbar />

        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <SectionTransition className="text-center max-w-3xl mx-auto mb-12">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Watch</div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-gray-900 dark:text-white">
                See in action
              </h1>
              <div className="flex justify-center mb-12">
                <BookDemoModal>
                  <Button size="lg">Book a Demo</Button>
                </BookDemoModal>
              </div>

              {/* Video Cards Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-16">
                {[
                  {
                    title: "CRM",
                    thumbnail: "/demo-thumbnails/ai-lindy-crm-updated.png",
                    videoUrl: "https://www.youtube.com/embed/ihUYrvytaEU?rel=0&modestbranding=1&showinfo=0",
                  },
                  {
                    title: "ACORD",
                    thumbnail: "/demo-thumbnails/ai-lindy-acord.png",
                    videoUrl: "https://www.youtube.com/embed/iFgFb4KM5Vs?rel=0&modestbranding=1&showinfo=0",
                  },
                  {
                    title: "POE",
                    thumbnail: "/demo-thumbnails/ai-lindy-poe.png",
                    videoUrl: "https://www.youtube.com/embed/9oNUZ3Hfvks?rel=0&modestbranding=1&showinfo=0",
                  },
                  {
                    title: "Rater",
                    thumbnail: "/demo-thumbnails/ai-lindy-rater.png",
                    videoUrl: "https://www.youtube.com/embed/dZU1aS0ynLE?rel=0&modestbranding=1&showinfo=0",
                  },
                  {
                    title: "Email and Calendar",
                    thumbnail: "/demo-thumbnails/ai-lindy-email.png",
                    videoUrl: "https://www.youtube.com/embed/fjzkqm3rzC4?rel=0&modestbranding=1&showinfo=0",
                  },
                  {
                    title: "Tasks",
                    thumbnail: "/demo-thumbnails/ai-lindy-tasks.png",
                    videoUrl: "https://www.youtube.com/embed/hnj4Wq6WPkE?rel=0&modestbranding=1&showinfo=0",
                  },
                  {
                    title: "Knowledge base",
                    thumbnail: "/demo-thumbnails/ai-lindy-knowledge.png",
                    videoUrl: "https://www.youtube.com/embed/nTPnpBLch4I?rel=0&modestbranding=1&showinfo=0",
                  },
                ].map((video, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                  >
                    <div className="relative cursor-pointer group" onClick={() => setSelectedVideo(video)}>
                      <Image
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        width={350}
                        height={200}
                        className="w-full h-48 object-cover"
                        unoptimized
                        priority={index < 2}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-normal mb-0 text-gray-900 dark:text-white text-left">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Modal */}
              {selectedVideo && typeof selectedVideo === "object" && selectedVideo.title && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedVideo.title}</h3>
                      <button
                        onClick={() => setSelectedVideo(null)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        src={selectedVideo.videoUrl}
                        title={selectedVideo.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}
            </SectionTransition>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}

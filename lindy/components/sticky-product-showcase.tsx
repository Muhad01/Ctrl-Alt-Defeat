"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  src: string
  poster?: string
  title: string
}

const VideoPlayer = ({ src, poster, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        // Play returns a Promise
        const playPromise = videoRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((error) => {
              // Auto-play was prevented or other error
              console.log("Play error:", error)
              setIsPlaying(false)
            })
        }
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(progress)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Add loadedmetadata event listener
    const handleVideoLoaded = () => {
      video.setAttribute("data-loaded", "true")
    }

    video.addEventListener("loadedmetadata", handleVideoLoaded)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only attempt to play if the video is loaded and visible
          if (entry.isIntersecting && video.getAttribute("data-loaded") === "true") {
            // Use the Promise-based approach for play
            const playPromise = video.play()

            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true)
                })
                .catch((error) => {
                  // Auto-play was prevented or other error
                  console.log("Auto-play error:", error)
                  // Don't update state to avoid UI inconsistency
                })
            }
          } else if (!entry.isIntersecting && isPlaying) {
            video.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: 0.6 },
    )

    observer.observe(video)

    return () => {
      video.removeEventListener("loadedmetadata", handleVideoLoaded)
      observer.unobserve(video)
    }
  }, [isPlaying])

  return (
    <div className="relative rounded-lg overflow-hidden bg-black/5 shadow-lg">
      <video
        ref={videoRef}
        className="w-full h-auto rounded-lg"
        poster={poster || "/placeholder.svg?height=720&width=1280&query=AI assistant dashboard interface"}
        muted={isMuted}
        playsInline
        preload="metadata"
        data-loaded="false"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        aria-label={title}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={handleFullscreen}
            aria-label="Full screen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>
    </div>
  )
}

interface ImageGalleryProps {
  images: { src: string; alt: string }[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg">
      <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden">
        <img
          src={images[currentIndex].src || "/placeholder.svg"}
          alt={images[currentIndex].alt}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={prevImage}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={nextImage}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-2 px-4">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex ? "bg-primary w-4" : "bg-gray-300",
            )}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function StickyProductShowcase() {
  return null
}

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { VideoPlayer } from "./video-player"
import type { Video } from "../types"
import { usePathname } from "next/navigation"

interface VideoFeedProps {
  videos: Video[]
  initialSlug?: string
}

export function VideoFeed({ videos, initialSlug }: VideoFeedProps) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  const getInitialIndex = useCallback(() => {
    if (initialSlug) {
      const index = videos.findIndex((v) => v.slug === initialSlug)
      return index > -1 ? index : 0
    }
    return 0
  }, [initialSlug, videos])

  const [activeIndex, setActiveIndex] = useState(getInitialIndex)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute("data-index") || "0", 10)
            setActiveIndex(index)
            const video = videos[index]
            if (video && pathname !== `/${video.slug}`) {
              window.history.replaceState(null, "", `/${video.slug}`)
            }
          }
        })
      },
      {
        root: container,
        threshold: 0.5,
      },
    )

    const videoElements = container.querySelectorAll(".video-container")
    videoElements.forEach((el) => observer.observe(el))

    return () => {
      videoElements.forEach((el) => observer.unobserve(el))
    }
  }, [pathname, videos])

  useEffect(() => {
    const initialIndex = getInitialIndex()
    const container = containerRef.current
    if (container && container.children[initialIndex]) {
      const videoElement = container.children[initialIndex] as HTMLElement
      videoElement.scrollIntoView({ behavior: "auto", block: "start" })
    }
  }, [getInitialIndex])

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full bg-[#212121] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          data-index={index}
          className="video-container h-[100dvh] w-full snap-start snap-always flex items-center justify-center"
        >
          <div className="relative h-full w-full md:w-auto md:h-full md:max-h-[95dvh] md:aspect-[9/16] md:rounded-2xl overflow-hidden md:shadow-2xl bg-black">
            <VideoPlayer video={video} isActive={index === activeIndex} />
          </div>
        </div>
      ))}
    </div>
  )
}

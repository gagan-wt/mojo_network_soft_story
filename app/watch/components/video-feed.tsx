"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { VideoPlayer } from "./video-player"
import type { Video, ApiVideo } from "../types"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface VideoFeedProps {
  videos: Video[]
  initialSlug?: string
  domainName: string
}

export function VideoFeed({ videos: initialVideos, initialSlug, domainName }: VideoFeedProps) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreStories, setHasMoreStories] = useState(true)
  const [showEndMessage, setShowEndMessage] = useState(false)
  const [messageShownForCurrentVisit, setMessageShownForCurrentVisit] = useState(false)

  const [activeIndex, setActiveIndex] = useState(() => {
    if (initialSlug) {
      const index = initialVideos.findIndex((v) => v.slug === initialSlug)
      return index > -1 ? index : 0
    }
    return 0
  })

  const loadMoreVideos = useCallback(async () => {
    if (isLoadingMore || !hasMoreStories) return

    setIsLoadingMore(true)

    try {
      const formData = new FormData()
      formData.append("page_no", (currentPage + 1).toString())
      formData.append("domain_name", domainName)
      formData.append("slug", "") // blank slug for pagination

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/softStoryWatch`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch more videos: ${res.statusText}`)
      }

      const response = await res.json()
      const { status, message, data } = response

      if (status === 200 && Array.isArray(data) && data.length === 0) {
        setHasMoreStories(false)
        setShowEndMessage(true)
      } else if (Array.isArray(data) && data.length > 0) {
        const newVideos: Video[] = data.map((apiVideo: ApiVideo) => ({
          id: apiVideo.slug,
          title: apiVideo.story_title,
          description: apiVideo.story_description,
          slug: apiVideo.slug,
          src: apiVideo.generated_story_url,
          reporterName: apiVideo.reporter_name,
          channelName: apiVideo.channel_name,
          domain: domainName,
        }))

        setVideos((prev) => [...prev, ...newVideos])
        setCurrentPage((prev) => prev + 1)
      } else {
        setHasMoreStories(false)
        setShowEndMessage(true)
      }
    } catch (error) {
      console.error("Failed to load more videos:", error)
      setHasMoreStories(false)
      setShowEndMessage(true)
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentPage, domainName, isLoadingMore, hasMoreStories])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showEndMessage) {
      timeout = setTimeout(() => {
        setShowEndMessage(false)
      }, 4000)
    }
    return () => clearTimeout(timeout)
  }, [showEndMessage])

  useEffect(() => {
    const isOnLastStory = activeIndex === videos.length - 1

    if (!isOnLastStory) {
      // User left the last story, reset the flag and hide message
      if (messageShownForCurrentVisit) {
        setMessageShownForCurrentVisit(false)
      }
      if (showEndMessage) {
        setShowEndMessage(false)
      }
    } else if (isOnLastStory && !hasMoreStories && !messageShownForCurrentVisit && !isLoadingMore) {
      // User is on last story, no more stories available, and we haven't shown the message yet
      setShowEndMessage(true)
      setMessageShownForCurrentVisit(true)
    }
  }, [activeIndex, videos.length, hasMoreStories, messageShownForCurrentVisit, isLoadingMore, showEndMessage])

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
            console.log("Pathname:", pathname, "Video slug:", video?.slug)
            if (video && pathname !== `/watch/${video.slug}`) {
              const basePath = window.location.pathname.split("/watch")[0]
              window.history.replaceState(null, "", `${basePath}/watch/${video.slug}`)
            }

            if (index >= videos.length - 2 && hasMoreStories && !isLoadingMore) {
              loadMoreVideos()
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
  }, [pathname, videos, hasMoreStories, isLoadingMore, loadMoreVideos])

  useEffect(() => {
    const initialIndex = (() => {
      if (initialSlug) {
        const index = initialVideos.findIndex((v) => v.slug === initialSlug)
        return index > -1 ? index : 0
      }
      return 0
    })()
    const container = containerRef.current
    if (container && container.children[initialIndex]) {
      const videoElement = container.children[initialIndex] as HTMLElement
      videoElement.scrollIntoView({ behavior: "auto", block: "start" })
    }
  }, [initialVideos, initialSlug])

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full bg-[#212121] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          data-index={index}
          className="video-container h-[100dvh] w-full snap-start snap-always flex items-center justify-center relative"
        >
          <div className="relative h-full w-full md:w-auto md:h-full md:max-h-[95dvh] md:aspect-[9/16] md:rounded-2xl overflow-hidden md:shadow-2xl bg-black">
            <VideoPlayer video={video} isActive={index === activeIndex} />
            {index === activeIndex && isLoadingMore && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                <div
                  className="bg-white backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2"
                  style={{ minWidth: "max-content" }}
                >
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span className="text-black text-sm">Loading More Stories</span>
                </div>
              </div>
            )}
            {index === videos.length - 1 && !hasMoreStories && showEndMessage && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                <div className="bg-white backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <span className="text-black text-sm">No More Stories</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
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

  const isLoadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMoreVideos = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreStories) return

    isLoadingRef.current = true
    setIsLoadingMore(true)

    try {
      const nextPage = currentPage + 1
      const formData = new FormData()
      formData.append("page_no", nextPage.toString())
      formData.append("domain_name", domainName)
      formData.append("slug", "")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/softStoryWatch`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const response = await res.json()
      const { status, data } = response

      if (status === 200 && Array.isArray(data)) {
        if (data.length === 0) {
          setHasMoreStories(false)
          setShowEndMessage(true)
        } else {
          setVideos((prev) => {
            const existingSlugs = new Set(prev.map(v => v.slug))
            const newVideos: Video[] = data
              .filter((apiVideo: ApiVideo) => !existingSlugs.has(apiVideo.slug))
              .map((apiVideo: ApiVideo) => ({
                id: apiVideo.slug,
                title: apiVideo.story_title,
                description: apiVideo.story_description,
                slug: apiVideo.slug,
                src: apiVideo.generated_story_url,
                reporterName: apiVideo.reporter_name,
                channelName: apiVideo.channel_name,
                domain: domainName,
              }))

            if (newVideos.length === 0) {
              setHasMoreStories(false)
              return prev
            }
            return [...prev, ...newVideos]
          })
          setCurrentPage(nextPage)
        }
      }
    } catch (error) {
      console.error("Failed to load more videos:", error)
    } finally {
      isLoadingRef.current = false
      setIsLoadingMore(false)
    }
  }, [currentPage, domainName, hasMoreStories])

  // Effect for setting active index based on scroll
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
            if (video && pathname !== `/watch/${video.slug}`) {
              const basePath = window.location.pathname.split("/watch")[0]
              window.history.replaceState(null, "", `${basePath}/watch/${video.slug}`)
            }
          }
        })
      },
      { root: container, threshold: 0.5 }
    )

    const videoElements = container.querySelectorAll(".video-container")
    videoElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [videos, pathname])

  // Effect for infinite scroll (sentinel)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMoreStories) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current) {
          loadMoreVideos()
        }
      },
      { root: containerRef.current, threshold: 0.1, rootMargin: "200px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMoreStories, loadMoreVideos])

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
      if (messageShownForCurrentVisit) {
        setMessageShownForCurrentVisit(false)
      }
      if (showEndMessage) {
        setShowEndMessage(false)
      }
    } else if (isOnLastStory && !hasMoreStories && !messageShownForCurrentVisit && !isLoadingMore) {
      setShowEndMessage(true)
      setMessageShownForCurrentVisit(true)
    }
  }, [activeIndex, videos.length, hasMoreStories, messageShownForCurrentVisit, isLoadingMore, showEndMessage])

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
      {hasMoreStories && (
        <div ref={sentinelRef} className="h-20 w-full flex items-center justify-center">
          {isLoadingMore && <Loader2 className="w-6 h-6 animate-spin text-white/50" />}
        </div>
      )}
    </div>
  )
}
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Loader2, ArrowLeft } from "lucide-react"
import { DoubleTap } from "./double-tap"
import { TimelineBar } from "./timeline-bar"
import { ControlPanel } from "./control-panel"
import type { Video } from "../types"

interface VideoPlayerProps {
  video: Video
  isActive: boolean
}

export function VideoPlayer({ video, isActive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wasPlayingRef = useRef(false)
  const timeUpdateThrottleRef = useRef<number>(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Cleanup video when inactive to free memory
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isActive) {
      videoElement.play().catch(() => setIsPlaying(false))
    } else {
      videoElement.pause()
      videoElement.currentTime = 0
      // Remove video source to free memory when not active
      videoElement.removeAttribute('src')
      videoElement.load()
      setIsLoading(true)
      setIsDescriptionExpanded(false)
      setProgress(0)
    }
  }, [isActive])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // Throttled time update to reduce state updates (improves performance)
    const handleTimeUpdate = () => {
      const now = Date.now()
      if (now - timeUpdateThrottleRef.current > 100) { // Update max 10 times per second
        timeUpdateThrottleRef.current = now
        if (videoElement.duration > 0) {
          setProgress(videoElement.currentTime / videoElement.duration)
        }
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleLoadedMetadata = () => setDuration(videoElement.duration)
    const handleWaiting = () => setIsLoading(true)
    const handleCanPlayThrough = () => setIsLoading(false)

    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)
    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata)
    videoElement.addEventListener("waiting", handleWaiting)
    videoElement.addEventListener("canplaythrough", handleCanPlayThrough)

    if (videoElement.readyState >= 3) setIsLoading(false)

    return () => {
      videoElement.removeEventListener("play", handlePlay)
      videoElement.removeEventListener("pause", handlePause)
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata)
      videoElement.removeEventListener("waiting", handleWaiting)
      videoElement.removeEventListener("canplaythrough", handleCanPlayThrough)
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    if (videoRef.current?.paused) videoRef.current?.play()
    else videoRef.current?.pause()
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }, [])

  const handleSeek = useCallback(
    (newProgress: number) => {
      if (videoRef.current && isFinite(duration)) {
        videoRef.current.currentTime = newProgress * duration
        setProgress(newProgress)
      }
    },
    [duration],
  )

  const handleSeekStart = useCallback(() => {
    if (videoRef.current) {
      wasPlayingRef.current = !videoRef.current.paused
      videoRef.current.pause()
    }
  }, [])

  const handleSeekEnd = useCallback(() => {
    if (videoRef.current && wasPlayingRef.current) {
      videoRef.current.play()
    }
  }, [])

  const handleClose = useCallback(() => {
    window.location.href = window.location.origin
  }, [])

  const toggleDescription = useCallback(() => {
    setIsDescriptionExpanded(prev => !prev)
  }, [])

  return (
    <div className="relative w-full h-full bg-black">
      <button
        onClick={handleClose}
        className="absolute top-3 left-4 border rounded-3xl flex items-center gap-1 text-slate-200 group ml-auto hover:bg-slate-700 border-slate-200"
        style={{ zIndex: 9999 }}
        aria-label="Back"
      >
        <div className="py-1 px-2.5 rounded-full transition-colors flex gap-1 items-center">
          <ArrowLeft size={16} className="icon-shadow" />
          <span className="text-[11px] font-semibold text-shadow">Back</span>
        </div>
      </button>

      <DoubleTap onDoubleTap={togglePlayPause}>
        <video
          ref={videoRef}
          src={isActive ? video.src : undefined}
          className="w-full h-full object-contain"
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
        />
      </DoubleTap>

      {(isLoading || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isLoading ? (
            <div className="bg-black/50 p-4 rounded-full">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          ) : (
            <div className="bg-black/50 p-6 rounded-full">
              <Play className="w-12 h-12 text-white" fill="white" />
            </div>
          )}
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex items-end">
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-base text-shadow truncate">{video.reporterName}</p>
            <span className="text-xs text-white/80">•</span>
            <p className="text-sm font-semibold text-shadow text-green-400">{video.channelName}</p>
          </div>
          <p className="text-xs text-white/70 text-shadow">{video.domain}</p>
          <h3 className="font-semibold text-base text-shadow mt-2 text-balance">{video.title}</h3>
          <div onClick={toggleDescription} className="cursor-pointer mt-1 pointer-events-auto">
            <p
              className={`text-sm text-white/90 text-shadow text-balance ${!isDescriptionExpanded ? "line-clamp-1" : ""}`}
            >
              {video.description}
              {!isDescriptionExpanded && <span className="font-semibold text-white/70 ml-1">...more</span>}
            </p>
          </div>
          <div className="mt-2">
            <TimelineBar
              progress={progress}
              duration={duration}
              onSeek={handleSeek}
              onSeekStart={handleSeekStart}
              onSeekEnd={handleSeekEnd}
            />
          </div>
        </div>
        <div className="flex-shrink-0 ml-3">
          <ControlPanel video={video} isMuted={isMuted} onMuteToggle={toggleMute} />
        </div>
      </div>
    </div>
  )
}
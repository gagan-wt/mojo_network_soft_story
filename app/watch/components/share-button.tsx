"use client"

import { Share2 } from "lucide-react"
import { useState } from "react"
import type { Video } from "../types"

interface ShareButtonProps {
  video: Video
}

export function ShareButton({ video }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/soft-stories/${video.slug}`
    const shareData = {
      title: `Check out this story: ${video.title}`,
      text: `Watch "${video.title}" from ${video.channelName}`,
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex flex-col items-center gap-1 text-white group"
      aria-label="Share video"
    >
      <div className="p-2.5 rounded-full group-hover:bg-green-500 transition-colors">
        {copied ? <span className="text-xs">Copied!</span> : <Share2 size={26} className="icon-shadow" />}
      </div>
      <span className="text-[11px] font-semibold text-shadow">Share</span>
    </button>
  )
}

"use client"

import { useRef, type ReactNode } from "react"

interface DoubleTapProps {
  onDoubleTap: () => void
  children: ReactNode
}

export function DoubleTap({ onDoubleTap, children }: DoubleTapProps) {
  const tapTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastTap = useRef(0)

  const handleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      // 300ms threshold for double tap
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current)
        tapTimeout.current = null
      }
      onDoubleTap()
    } else {
      tapTimeout.current = setTimeout(() => {
        // Single tap action could go here if needed
      }, 300)
    }
    lastTap.current = now
  }

  return (
    <div onTouchStart={handleTap} onClick={handleTap} className="w-full h-full">
      {children}
    </div>
  )
}

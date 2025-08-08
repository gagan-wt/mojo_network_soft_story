"use client"

import { useRef, type ReactNode } from "react"

interface DoubleTapProps {
  onDoubleTap: () => void
  onSingleTap?: () => void // ✅ Add single tap support
  children: ReactNode
}

export function DoubleTap({ onDoubleTap, onSingleTap, children }: DoubleTapProps) {
  const tapTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastTap = useRef(0)

  const handleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      // Double tap detected
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current)
        tapTimeout.current = null
      }
      onDoubleTap()
    } else {
      // Wait for second tap
      tapTimeout.current = setTimeout(() => {
        if (onSingleTap) onSingleTap()
        tapTimeout.current = null
      }, 300)
    }
    lastTap.current = now
  }

  return (
    <div
      onTouchStart={handleTap}
      onPointerUp={handleTap}
      className="w-full h-full"
      style={{ touchAction: "manipulation" }}
    >
      {children}
    </div>
  )
}

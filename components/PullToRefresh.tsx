'use client'

import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 65
const MAX_PULL = 90
const INDICATOR_SIZE = 40

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pullRef = useRef(0)
  const refreshingRef = useRef(false)

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY === 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null || refreshingRef.current) return
      const diff = e.touches[0].clientY - startY.current
      if (diff > 0 && window.scrollY === 0) {
        const next = Math.min(diff * 0.45, MAX_PULL)
        pullRef.current = next
        setPull(next)
      }
    }

    function onTouchEnd() {
      if (startY.current === null || refreshingRef.current) return
      startY.current = null
      if (pullRef.current >= THRESHOLD) {
        refreshingRef.current = true
        setRefreshing(true)
        setPull(THRESHOLD)
        setTimeout(() => {
          window.location.reload()
        }, 600)
      } else {
        pullRef.current = 0
        setPull(0)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  // indicator slides down from top as user pulls
  const indicatorTop = pull - INDICATOR_SIZE
  const ready = pull >= THRESHOLD
  const opacity = Math.min(pull / THRESHOLD, 1)

  return (
    <>
      <div
        aria-hidden
        className="fixed left-0 right-0 flex justify-center z-50 pointer-events-none"
        style={{
          top: indicatorTop,
          opacity,
          transition: pull === 0 ? 'top 0.2s ease, opacity 0.2s ease' : undefined,
        }}
      >
        <div
          className="w-10 h-10 rounded-full bg-white shadow-lg border border-pink-100 flex items-center justify-center text-xl"
          style={{ transform: `rotate(${pull * 3}deg)` }}
        >
          {refreshing ? (
            <span className="animate-spin inline-block">🌸</span>
          ) : (
            <span style={{ opacity: ready ? 1 : 0.6 }}>🌸</span>
          )}
        </div>
      </div>

      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: pull === 0 ? 'transform 0.2s ease' : undefined,
        }}
      >
        {children}
      </div>
    </>
  )
}

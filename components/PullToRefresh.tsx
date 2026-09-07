'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const THRESHOLD = 70
const MAX_PULL = 100

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pullRef = useRef(0)
  const refreshingRef = useRef(false)
  const router = useRouter()

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
        const next = Math.min(diff * 0.5, MAX_PULL)
        pullRef.current = next
        setPull(next)
      }
    }

    function onTouchEnd() {
      if (startY.current === null || refreshingRef.current) return
      startY.current = null
      if (pullRef.current > THRESHOLD) {
        refreshingRef.current = true
        setRefreshing(true)
        setPull(THRESHOLD)
        router.refresh()
        setTimeout(() => {
          refreshingRef.current = false
          setRefreshing(false)
          pullRef.current = 0
          setPull(0)
        }, 700)
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
  }, [router])

  return (
    <>
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 flex justify-center items-end overflow-hidden z-50 pointer-events-none"
        style={{ height: pull, transition: pull === 0 ? 'height 0.2s ease' : undefined }}
      >
        <span className={`pb-1 text-2xl ${refreshing ? 'animate-spin' : ''}`}>🌸</span>
      </div>
      <div
        style={{ transform: `translateY(${pull}px)`, transition: pull === 0 ? 'transform 0.2s ease' : undefined }}
      >
        {children}
      </div>
    </>
  )
}

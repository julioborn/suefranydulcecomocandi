'use client'

import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 70
const MAX_PULL = 100

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pull, setPull] = useState(0)
  const [releasing, setReleasing] = useState(false)
  const startY = useRef<number | null>(null)
  const pulling = useRef(false)
  const done = useRef(false)

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0 || done.current) return
      startY.current = e.touches[0].clientY
      pulling.current = false
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null || done.current) return
      const diff = e.touches[0].clientY - startY.current
      if (diff <= 0) return

      // Only activate if scroll is truly at top
      if (window.scrollY > 0) {
        startY.current = null
        return
      }

      pulling.current = true
      e.preventDefault()
      const next = Math.min(diff * 0.4, MAX_PULL)
      setPull(next)
    }

    function onTouchEnd() {
      if (!pulling.current || done.current) {
        startY.current = null
        pulling.current = false
        setPull(0)
        return
      }

      startY.current = null
      pulling.current = false

      setPull((current) => {
        if (current >= THRESHOLD) {
          done.current = true
          setReleasing(true)
          setTimeout(() => window.location.reload(), 500)
          return THRESHOLD
        }
        return 0
      })
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const progress = Math.min(pull / THRESHOLD, 1)

  return (
    <>
      {/* Indicador */}
      <div
        aria-hidden
        className="fixed left-0 right-0 z-50 pointer-events-none flex justify-center"
        style={{
          top: pull > 0 ? pull - 48 : -48,
          opacity: progress,
          transition: pull === 0 ? 'top 0.25s ease, opacity 0.25s ease' : undefined,
        }}
      >
        <div
          className="w-11 h-11 rounded-full bg-white shadow-md border border-pink-100 flex items-center justify-center text-xl"
          style={{
            transform: `rotate(${pull * 3.6}deg) scale(${0.7 + progress * 0.3})`,
            transition: pull === 0 ? 'transform 0.25s ease' : undefined,
          }}
        >
          {releasing ? <span className="animate-spin">🌸</span> : '🌸'}
        </div>
      </div>

      {/* Contenido */}
      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: pull === 0 ? 'transform 0.25s ease' : undefined,
        }}
      >
        {children}
      </div>
    </>
  )
}

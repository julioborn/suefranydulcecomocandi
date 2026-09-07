'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const LONG_PRESS_MS = 600

export default function HomeLogo() {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function start() {
    timerRef.current = setTimeout(() => {
      router.push('/admin')
    }, LONG_PRESS_MS)
  }

  function cancel() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <button
      type="button"
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="SDC"
      className="relative w-10 h-10 mx-auto mb-3 rounded-lg overflow-hidden select-none active:scale-95 transition-transform"
    >
      <Image
        src="/logos/sdc.JPG"
        alt=""
        fill
        draggable={false}
        className="object-contain pointer-events-none"
      />
    </button>
  )
}

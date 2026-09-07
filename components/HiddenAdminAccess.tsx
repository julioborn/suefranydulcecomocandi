'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

const HOLD_MS = 1200

export default function HiddenAdminAccess() {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function start() {
    timer.current = setTimeout(() => {
      router.push('/admin/login')
    }, HOLD_MS)
  }

  function cancel() {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  return (
    <button
      aria-hidden="true"
      tabIndex={-1}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchCancel={cancel}
      onTouchMove={cancel}
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed top-0 right-0 w-16 h-16 z-[60] opacity-0"
      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'none' }}
    />
  )
}

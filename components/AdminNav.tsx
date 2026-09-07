'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function AdminNav({ userEmail, userName }: { userEmail: string; userName?: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-[--border] px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[--bg-subtle]">
          <Image src="/logos/sdc.JPG" alt="SDC" fill className="object-contain" />
        </div>

        <Link
          href="/admin"
          className="font-serif text-base text-[--text] hover:text-[--accent] transition-colors"
        >
          Admin
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {(userName ?? userEmail) && (
            <span className="hidden sm:block text-xs text-[--text-muted]">
              {userName ?? userEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[--text-muted] hover:text-[--accent]
                       px-3 py-1.5 rounded-lg border border-transparent hover:border-[--border]
                       transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}

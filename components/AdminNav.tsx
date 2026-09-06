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
    <header className="bg-white/90 backdrop-blur-md border-b border-pink-100 px-4 py-3
                       shadow-[0_1px_8px_rgba(244,114,182,0.08)]">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <div className="flex gap-2 items-center">
          <div className="relative w-8 h-8">
            <Image src="/logos/suefran.jpg" alt="Suefran" fill className="object-contain" />
          </div>
          <div className="relative w-8 h-8">
            <Image src="/logos/dulcecomocandi.png" alt="Dulce Como Candi" fill className="object-contain" />
          </div>
        </div>

        <Link
          href="/admin"
          className="font-bold text-[#831843] text-sm hover:text-pink-500 transition-colors"
        >
          Admin
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {(userName ?? userEmail) && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-pink-50 text-pink-400
                             border border-pink-100 px-3 py-1 rounded-full font-medium">
              {userName ?? userEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[#c4a0b8] hover:text-pink-500
                       hover:bg-pink-50 px-3 py-1.5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}

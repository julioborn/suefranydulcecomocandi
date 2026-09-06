'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const USUARIO_MAP: Record<string, string> = {
  victoria: 'victoria@admin.local',
  lucia: 'lucia@admin.local',
  emilia: 'emilia@admin.local',
}

export default function LoginPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const email = USUARIO_MAP[usuario.toLowerCase().trim()]
    if (!email) {
      setError('Usuario o contraseña incorrectos.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Usuario o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 page-gradient relative overflow-hidden">
      {/* Decoración */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-[0_8px_32px_rgba(244,114,182,0.18)] p-8 flex flex-col items-center gap-7 border border-pink-100">
          {/* Logos */}
          <div className="flex gap-4 items-center">
            <div className="relative w-16 h-16 drop-shadow-sm">
              <Image src="/logos/suefran.jpg" alt="Suefran" fill className="object-contain" />
            </div>
            <div className="w-px h-10 bg-pink-100" />
            <div className="relative w-16 h-16 drop-shadow-sm">
              <Image src="/logos/dulcecomocandi.png" alt="Dulce Como Candi" fill className="object-contain" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-[#831843]">Panel de administración</h1>
            <p className="text-sm text-[#c4a0b8]">Ingresá con tu usuario</p>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider">Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                autoComplete="username"
                placeholder="victoria / lucia / emilia"
                className="border border-pink-100 bg-pink-50/50 rounded-xl px-4 py-3 text-sm text-[#4a1942]
                           placeholder:text-pink-200 focus:outline-none focus:border-pink-300 focus:bg-white
                           transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border border-pink-100 bg-pink-50/50 rounded-xl px-4 py-3 text-sm text-[#4a1942]
                           focus:outline-none focus:border-pink-300 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-sm text-rose-500 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

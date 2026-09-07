'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const USUARIO_MAP: Record<string, string> = {
  victoria: 'victoria@suefran.com',
  lucia: 'lucia@suefran.com',
  emilia: 'emilia@suefran.com',
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
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#FAF8F6]">
      <div className="w-full max-w-sm">
        {/* Logos */}
        <div className="flex justify-center gap-5 mb-8">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[--bg-subtle]">
            <Image src="/logos/suefran.jpg" alt="Suefran" fill className="object-contain p-1" />
          </div>
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[--bg-subtle]">
            <Image src="/logos/dulcecomocandi.png" alt="Dulce Como Candi" fill className="object-contain p-1" />
          </div>
        </div>

        <h1 className="font-serif text-2xl text-center text-[--text] mb-1">Panel de administración</h1>
        <p className="text-sm text-center text-[--text-muted] mb-8">Ingresá con tu usuario</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[--text]">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoComplete="username"
              placeholder="victoria, lucia o emilia"
              className="border border-[--border] bg-white rounded-xl px-4 py-3 text-[--text]
                         placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent]
                         transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[--text]">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border border-[--border] bg-white rounded-xl px-4 py-3 text-[--text]
                         focus:outline-none focus:border-[--accent] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex flex-col min-h-screen bg-[#FAF8F6]">
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-12 gap-10">

        {/* Encabezado */}
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] text-[--text-muted] mb-3">
            Calchaquí, Santa Fe
          </p>
          <h1 className="font-serif text-4xl text-[--text] leading-tight">
            Nuestras tiendas
          </h1>
        </div>

        {/* Cards con toldito */}
        <div className="flex flex-row gap-4 w-full max-w-sm mx-auto">
          {/* Suefran */}
          <Link
            href="/suefran"
            className="group flex-1 flex flex-col items-center gap-3 bg-white rounded-2xl p-5
                       shadow-[var(--shadow)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-200"
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[--bg-subtle]">
              <Image src="/logos/suefran.jpg" alt="Suefran" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="text-center">
              <p className="font-serif text-lg text-[--text]">Suefran</p>
              <p className="text-xs text-[--text-muted] mt-0.5">Accesorios</p>
            </div>
          </Link>

          {/* Dulce Como Candi */}
          <Link
            href="/dulce-como-candi"
            className="group flex-1 flex flex-col items-center gap-3 bg-white rounded-2xl p-5
                       shadow-[var(--shadow)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-200"
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[--bg-subtle]">
              <Image src="/logos/dulcecomocandi.png" alt="Dulce Como Candi" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="text-center">
              <p className="font-serif text-lg text-[--text]">Dulce Como Candi</p>
              <p className="text-xs text-[--text-muted] mt-0.5">Ropa</p>
            </div>
          </Link>
        </div>

        {/* Botón admin — solo si hay sesión */}
        {user && (
          <Link
            href="/admin"
            className="text-sm text-[--text-muted] bg-white shadow-[var(--shadow)]
                       px-5 py-2.5 rounded-xl hover:shadow-[var(--shadow-hover)] hover:text-[--accent]
                       transition-all duration-200"
          >
            Administración
          </Link>
        )}
      </div>

      <footer className="py-6 px-4 text-center border-t border-[#EDE7EB]">
        <a
          href="https://maps.google.com/?q=Roque+Sáenz+Peña+1054,+Calchaquí,+Santa+Fe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[--text-muted] hover:text-[--accent] transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          Roque Sáenz Peña 1054, Calchaquí, Santa Fe
        </a>
      </footer>
    </main>
  )
}

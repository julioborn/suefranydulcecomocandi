import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import HomeLogo from '@/components/HomeLogo'

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#FAF8F6]">
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-12 gap-10">

        {/* Encabezado */}
        <div className="text-center">
          <HomeLogo />
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
            <p className="text-xs tracking-[0.2em] text-[--text-muted] uppercase">Accesorios</p>
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
            <p className="text-xs tracking-[0.2em] text-[--text-muted] uppercase">Ropa</p>
          </Link>
        </div>
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

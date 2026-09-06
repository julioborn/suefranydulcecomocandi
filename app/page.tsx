import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen page-gradient">
      {/* Círculos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-pink-300/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 px-6 py-16 gap-10">
        {/* Título */}
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold tracking-[0.25em] text-pink-400 uppercase">Calchaquí, Santa Fe</p>
          <h1 className="text-3xl font-bold text-[#831843]">Nuestras tiendas</h1>
          <p className="text-sm text-[#c4a0b8]">Elegí una tienda para ver el catálogo</p>
        </div>

        {/* Cards de tiendas */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
          {/* Suefran */}
          <Link
            href="/suefran"
            className="group flex-1 flex flex-col items-center gap-5 bg-white/80 backdrop-blur rounded-3xl p-8
                       border border-pink-100 shadow-[0_4px_24px_rgba(244,114,182,0.12)]
                       hover:shadow-[0_8px_32px_rgba(244,114,182,0.25)] hover:border-pink-200
                       hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative w-36 h-36 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
              <Image src="/logos/suefran.jpg" alt="Suefran" fill className="object-contain" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#831843]">Suefran</p>
              <span className="inline-block mt-1 text-xs bg-pink-50 text-pink-400 px-3 py-0.5 rounded-full font-medium">
                Accesorios
              </span>
            </div>
          </Link>

          {/* Dulce Como Candi */}
          <Link
            href="/dulce-como-candi"
            className="group flex-1 flex flex-col items-center gap-5 bg-white/80 backdrop-blur rounded-3xl p-8
                       border border-pink-100 shadow-[0_4px_24px_rgba(244,114,182,0.12)]
                       hover:shadow-[0_8px_32px_rgba(244,114,182,0.25)] hover:border-pink-200
                       hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative w-36 h-36 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
              <Image src="/logos/dulcecomocandi.png" alt="Dulce Como Candi" fill className="object-contain" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#831843]">Dulce Como Candi</p>
              <span className="inline-block mt-1 text-xs bg-pink-50 text-pink-400 px-3 py-0.5 rounded-full font-medium">
                Ropa
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-6 px-4 text-center border-t border-pink-100/60">
        <a
          href="https://maps.google.com/?q=Roque+Sáenz+Peña+1054,+Calchaquí,+Santa+Fe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#c4a0b8] hover:text-pink-400 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          Roque Sáenz Peña 1054, Calchaquí, Santa Fe
        </a>
      </footer>
    </main>
  )
}

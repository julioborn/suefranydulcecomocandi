import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Store } from '@/types'
import { Package, BarChart2 } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: stores } = await supabase.from('stores').select('*').returns<Store[]>()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold tracking-widest text-[#c4a0b8] uppercase mb-1">Panel</p>
        <h1 className="text-2xl font-bold text-[#831843]">Dashboard</h1>
      </div>

      <section>
        <p className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-widest mb-4">Tiendas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {(stores ?? []).map((store) => (
            <div
              key={store.id}
              className="card p-6 flex flex-col gap-5 hover:shadow-[0_6px_24px_rgba(244,114,182,0.16)] transition-shadow"
            >
              {/* Logo + info */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 p-1 ring-1 ring-pink-100">
                  <Image src={store.logo_url ?? ''} alt={store.name} fill className="object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-[#831843] text-base">{store.name}</h3>
                  <span className="inline-block mt-1 text-[11px] bg-pink-50 text-pink-400 border border-pink-100
                                   px-2.5 py-0.5 rounded-full font-medium capitalize">
                    {store.category}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/${store.slug}/productos`}
                  className="flex-1 flex items-center justify-center gap-2 btn-primary text-sm py-2.5"
                >
                  <Package className="w-4 h-4" />
                  Productos
                </Link>
                <Link
                  href={`/admin/${store.slug}/estadisticas`}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5
                             border border-pink-200 text-pink-400 rounded-2xl
                             hover:bg-pink-50 hover:border-pink-300 transition-all"
                >
                  <BarChart2 className="w-4 h-4" />
                  Estadísticas
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

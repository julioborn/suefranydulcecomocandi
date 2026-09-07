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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[--text-muted] mb-1">Panel</p>
          <h1 className="font-serif text-2xl text-[--text]">Dashboard</h1>
        </div>
        <Link
          href="/"
          className="text-sm text-[--text-muted] shadow-[var(--shadow)] hover:shadow-[var(--shadow-hover)] bg-white
                     px-4 py-2 rounded-xl hover:border-[--accent] hover:text-[--accent] transition-all"
        >
          Ver tiendas
        </Link>
      </div>

      <section>
        <p className="text-xs text-[--text-muted] mb-4">Tiendas</p>
        <div className="grid grid-cols-2 gap-4">
          {(stores ?? []).map((store) => (
            <div key={store.id} className="card p-4 flex flex-col gap-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[--bg-subtle]">
                  <Image src={store.logo_url ?? ''} alt={store.name} fill className="object-contain p-1" />
                </div>
                <div className="w-full min-w-0">
                  <h3 className="font-serif text-base text-[--text] leading-tight break-words">{store.name}</h3>
                  <p className="text-xs text-[--text-muted] capitalize mt-0.5">{store.category}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={`/admin/${store.slug}/productos`}
                  className="btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  <Package className="w-4 h-4" />
                  Productos
                </Link>
                <Link
                  href={`/admin/${store.slug}/estadisticas`}
                  className="flex items-center justify-center gap-2 text-sm font-medium py-2.5
                             shadow-[var(--shadow)] hover:shadow-[var(--shadow-hover)] text-[--text-muted] rounded-xl
                             hover:border-[--accent] hover:text-[--accent] transition-all"
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

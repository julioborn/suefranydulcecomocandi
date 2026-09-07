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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(stores ?? []).map((store) => (
            <div key={store.id} className="card p-5 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[--bg-subtle]">
                  <Image src={store.logo_url ?? ''} alt={store.name} fill className="object-contain p-1" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[--text]">{store.name}</h3>
                  <p className="text-xs text-[--text-muted] capitalize mt-0.5">{store.category}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/${store.slug}/productos`}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5"
                >
                  <Package className="w-4 h-4" />
                  Productos
                </Link>
                <Link
                  href={`/admin/${store.slug}/estadisticas`}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5
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

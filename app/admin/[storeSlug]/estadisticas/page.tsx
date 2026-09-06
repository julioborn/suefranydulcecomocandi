import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Store, Product } from '@/types'
import StatsClient from '@/components/StatsClient'

interface PageProps {
  params: Promise<{ storeSlug: string }>
}

export default async function EstadisticasPage({ params }: PageProps) {
  const { storeSlug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', storeSlug)
    .single<Store>()

  if (!store) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs text-gray-400 hover:text-[#e8427a]">
          ← Dashboard
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 mt-1">
          {store.name} — Estadísticas
        </h1>
      </div>

      <StatsClient products={(products ?? []) as Product[]} store={store} />
    </div>
  )
}

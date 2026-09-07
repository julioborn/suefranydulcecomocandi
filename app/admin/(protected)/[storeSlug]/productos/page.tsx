import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Store, Product, ProductMedia } from '@/types'
import ProductListClient from '@/components/ProductListClient'

interface PageProps {
  params: Promise<{ storeSlug: string }>
}

export default async function ProductosPage({ params }: PageProps) {
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
    .select('*, product_media(*)')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-gray-400 hover:text-[#e8427a]">← Dashboard</Link>
          <h1 className="text-xl font-semibold text-gray-800 mt-1">{store.name} — Productos</h1>
        </div>
        <Link
          href={`/admin/${storeSlug}/productos/nuevo`}
          className="bg-[#e8427a] hover:bg-[#d63570] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <ProductListClient
        initialProducts={(products ?? []) as (Product & { product_media: ProductMedia[] })[]}
        store={store}
        storeSlug={storeSlug}
      />
    </div>
  )
}

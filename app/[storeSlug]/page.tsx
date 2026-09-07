import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, Store, ProductMedia } from '@/types'
import { MapPin } from 'lucide-react'
import StoreCatalog from '@/components/StoreCatalog'

interface PageProps {
  params: Promise<{ storeSlug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { storeSlug } = await params
  const supabase = await createClient()
  const { data: store } = await supabase.from('stores').select('name').eq('slug', storeSlug).single()
  return { title: store ? `${store.name} — Catálogo` : 'Catálogo' }
}

export default async function StorePage({ params }: PageProps) {
  const { storeSlug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase.from('stores').select('*').eq('slug', storeSlug).single<Store>()
  if (!store) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*), product_media(*)')
    .eq('store_id', store.id)
    .eq('sold', false)
    .order('created_at', { ascending: false })

  const productList = (products ?? []) as (Product & { product_media: ProductMedia[] })[]

  const categoryOrder: string[] = []
  const productsByCategory: Record<string, typeof productList> = {}
  for (const product of productList) {
    const key = product.category?.name?.trim() || 'Otros'
    if (!productsByCategory[key]) {
      categoryOrder.push(key)
      productsByCategory[key] = []
    }
    productsByCategory[key].push(product)
  }
  if (categoryOrder.includes('Otros')) {
    categoryOrder.splice(categoryOrder.indexOf('Otros'), 1)
    categoryOrder.push('Otros')
  }

  return (
    <main className="flex flex-col min-h-screen bg-[#FAF8F6]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAF8F6]/90 backdrop-blur-md border-b border-[--border] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-sm text-[--text-muted] hover:text-[--accent] transition-colors">
            ← Inicio
          </Link>
          <div className="h-4 w-px bg-[--border]" />
          <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-[--bg-subtle]">
            <Image src={store.logo_url ?? ''} alt={store.name} fill className="object-contain" />
          </div>
          <h1 className="font-serif text-base text-[--text]">{store.name}</h1>
          <span className="ml-auto text-xs text-[--text-muted] capitalize">{store.category}</span>
        </div>
      </header>

      <StoreCatalog
        store={store}
        storeSlug={storeSlug}
        categoryOrder={categoryOrder}
        productsByCategory={productsByCategory}
      />

      <footer className="py-5 px-4 text-center border-t border-[#F0EBEd]">
        <a
          href="https://maps.google.com/?q=Roque+Sáenz+Peña+1054,+Calchaquí,+Santa+Fe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[--text-muted] hover:text-[--accent] transition-colors"
        >
          <MapPin className="w-3 h-3" />
          Roque Sáenz Peña 1054, Calchaquí, Santa Fe
        </a>
      </footer>
    </main>
  )
}

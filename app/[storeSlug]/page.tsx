import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, Store, ProductMedia } from '@/types'
import { MapPin } from 'lucide-react'

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
    .select('*, product_media(*)')
    .eq('store_id', store.id)
    .eq('sold', false)
    .order('created_at', { ascending: false })

  const productList = (products ?? []) as (Product & { product_media: ProductMedia[] })[]

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

      {/* Grilla */}
      <section className="flex-1 px-4 py-6">
        {productList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="font-serif italic text-2xl text-[--text-muted]">Pronto habrá novedades</p>
            <p className="text-sm text-[--text-muted]">Volvé pronto a ver el catálogo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {productList.map((product) => {
              const cover = product.product_media?.find((m) => m.type === 'image')
              return (
                <Link
                  key={product.id}
                  href={`/${storeSlug}/${product.id}`}
                  className="group bg-white rounded-xl overflow-hidden border border-[--border]
                             hover:border-[--accent] transition-colors duration-200"
                >
                  <div className="relative aspect-square bg-[--bg-subtle]">
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-[--border]">🛍️</div>
                    )}
                  </div>
                  <div className="p-3 border-t border-[--border]">
                    <p className="text-sm text-[--text] font-medium truncate leading-snug">{product.name}</p>
                    <p className="text-sm font-semibold text-[--accent] mt-0.5">
                      ${product.price.toLocaleString('es-AR')}
                    </p>
                    {store.category === 'ropa' && product.talle && (
                      <p className="text-xs text-[--text-muted] mt-0.5">Talle {product.talle}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <footer className="py-5 px-4 text-center border-t border-[--border]">
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

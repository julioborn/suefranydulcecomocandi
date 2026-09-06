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
    <main className="flex flex-col min-h-screen page-gradient">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-pink-400 text-sm hover:text-pink-600 transition-colors font-medium">
            ← Inicio
          </Link>
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-pink-100">
            <Image src={store.logo_url ?? ''} alt={store.name} fill className="object-contain" />
          </div>
          <h1 className="font-bold text-[#831843]">{store.name}</h1>
          <span className="ml-auto text-xs bg-pink-50 text-pink-400 px-3 py-1 rounded-full font-medium capitalize">
            {store.category}
          </span>
        </div>
      </header>

      {/* Grilla */}
      <section className="flex-1 px-4 py-8">
        {productList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-3xl">🌸</div>
            <p className="text-[#831843] font-semibold text-lg">Pronto habrá novedades</p>
            <p className="text-[#c4a0b8] text-sm">Volvé pronto a ver el catálogo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {productList.map((product) => {
              const cover = product.product_media?.find((m) => m.type === 'image')
              return (
                <Link
                  key={product.id}
                  href={`/${storeSlug}/${product.id}`}
                  className="group bg-white/90 rounded-2xl overflow-hidden border border-pink-100
                             shadow-[0_2px_12px_rgba(244,114,182,0.08)]
                             hover:shadow-[0_6px_20px_rgba(244,114,182,0.2)]
                             hover:-translate-y-0.5 hover:border-pink-200
                             transition-all duration-300"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-rose-50">
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#4a1942] truncate">{product.name}</p>
                    <p className="text-sm text-pink-500 font-bold mt-0.5">
                      ${product.price.toLocaleString('es-AR')}
                    </p>
                    {store.category === 'ropa' && product.talle && (
                      <span className="inline-block mt-1.5 text-[10px] bg-pink-50 text-pink-400 px-2 py-0.5 rounded-full">
                        Talle {product.talle}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <footer className="py-5 px-4 text-center border-t border-pink-100/60">
        <a
          href="https://maps.google.com/?q=Roque+Sáenz+Peña+1054,+Calchaquí,+Santa+Fe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#c4a0b8] hover:text-pink-400 transition-colors"
        >
          <MapPin className="w-3 h-3" />
          Roque Sáenz Peña 1054, Calchaquí, Santa Fe
        </a>
      </footer>
    </main>
  )
}

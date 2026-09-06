'use client'

import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import type { Product, Store, ProductMedia } from '@/types'
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'

type FullProduct = Product & { store: Store; product_media: ProductMedia[] }

export default function ProductPage({
  params,
}: {
  params: Promise<{ storeSlug: string; productId: string }>
}) {
  const { storeSlug, productId } = use(params)
  const [product, setProduct] = useState<FullProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [mediaIndex, setMediaIndex] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('*, store:stores(*), product_media(*)')
      .eq('id', productId)
      .eq('sold', false)
      .single()
      .then(({ data }) => {
        setProduct(data ? (data as FullProduct) : null)
        setLoading(false)
      })
  }, [productId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen page-gradient">
        <div className="w-10 h-10 rounded-full border-2 border-pink-300 border-t-pink-500 animate-spin" />
      </div>
    )
  }

  if (!product) return notFound()

  const images = product.product_media?.filter((m) => m.type === 'image') ?? []
  const video = product.product_media?.find((m) => m.type === 'video')

  const waText = encodeURIComponent(
    `Hola! Me interesa el producto: ${product.name} de ${product.store.name}`
  )
  const waUrl = `https://wa.me/${product.store.whatsapp_number}?text=${waText}`

  return (
    <main className="max-w-lg mx-auto min-h-screen pb-28 page-gradient">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-3">
        <Link
          href={`/${storeSlug}`}
          className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-600 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          {product.store.name}
        </Link>
      </header>

      {/* Carrusel */}
      {images.length > 0 && (
        <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-rose-50">
          <Image src={images[mediaIndex]?.url} alt={product.name} fill className="object-cover" />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setMediaIndex((i) => Math.max(0, i - 1))}
                disabled={mediaIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-1.5 shadow-md disabled:opacity-30 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#831843]" />
              </button>
              <button
                onClick={() => setMediaIndex((i) => Math.min(images.length - 1, i + 1))}
                disabled={mediaIndex === images.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-1.5 shadow-md disabled:opacity-30 hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#831843]" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMediaIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === mediaIndex ? 'bg-pink-500 w-4' : 'bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Video */}
      {video && (
        <div className="w-full bg-black aspect-video">
          <video src={video.url} controls className="w-full h-full object-contain" />
        </div>
      )}

      {/* Info */}
      <div className="px-5 py-6 flex flex-col gap-5">
        {/* Nombre y precio */}
        <div className="card p-5">
          <h1 className="text-2xl font-bold text-[#831843]">{product.name}</h1>
          <div className="mt-2 inline-flex items-center bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 px-4 py-1.5 rounded-full">
            <span className="text-xl font-bold text-pink-500">
              ${product.price.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Descripción */}
        {product.description && (
          <div className="card p-5">
            <p className="text-sm text-[#6b3a5c] leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Detalles (ropa) */}
        {product.store.category === 'ropa' && (product.talle || (product.colores && product.colores.length > 0)) && (
          <div className="card p-5 flex flex-wrap gap-3">
            {product.talle && (
              <div className="bg-pink-50 rounded-2xl px-4 py-2.5 text-center">
                <p className="text-[10px] text-[#c4a0b8] uppercase tracking-wider font-medium">Talle</p>
                <p className="font-bold text-[#831843] mt-0.5">{product.talle}</p>
              </div>
            )}
            {product.colores && product.colores.length > 0 && (
              <div className="bg-pink-50 rounded-2xl px-4 py-2.5">
                <p className="text-[10px] text-[#c4a0b8] uppercase tracking-wider font-medium">Colores</p>
                <p className="font-semibold text-[#831843] mt-0.5 text-sm">{product.colores.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Stock (accesorios) */}
        {product.store.category === 'accesorios' && (
          <div className="card p-5">
            <p className="text-sm text-[#c4a0b8]">
              Unidades disponibles:{' '}
              <span className="font-bold text-[#831843]">{product.quantity}</span>
            </p>
          </div>
        )}
      </div>

      {/* Botón WhatsApp fijo */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white/80 backdrop-blur-md border-t border-pink-100 max-w-lg mx-auto">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full font-semibold py-4 rounded-2xl transition-all
                     bg-[#25D366] hover:bg-[#1ebe5d] text-white
                     shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)]
                     hover:-translate-y-0.5"
        >
          <MessageCircle className="w-5 h-5" />
          Consultar por WhatsApp
        </a>
      </div>
    </main>
  )
}

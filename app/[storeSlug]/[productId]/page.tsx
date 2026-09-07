'use client'

import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import type { Product, Store, ProductMedia } from '@/types'
import { MessageCircle, ChevronLeft, ChevronRight, Package } from 'lucide-react'

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
    <main className="max-w-lg mx-auto min-h-screen pb-28 bg-[#f8f8f8]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <Link
          href={`/${storeSlug}`}
          className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-600 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          {product.store.name}
        </Link>
      </header>

      <div className="bg-white">
        {/* Carrusel — altura fija más compacta */}
        {images.length > 0 ? (
          <div className="relative w-full h-72 bg-gray-50">
            <Image src={images[mediaIndex]?.url} alt={product.name} fill className="object-contain" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setMediaIndex((i) => Math.max(0, i - 1))}
                  disabled={mediaIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setMediaIndex((i) => Math.min(images.length - 1, i + 1))}
                  disabled={mediaIndex === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMediaIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        i === mediaIndex ? 'bg-pink-500 w-4' : 'bg-gray-300 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-pink-50 flex items-center justify-center">
            <Package className="w-12 h-12 text-pink-200" />
          </div>
        )}

        {/* Video */}
        {video && (
          <div className="w-full bg-black aspect-video">
            <video src={video.url} controls className="w-full h-full object-contain" />
          </div>
        )}

        {/* Precio + nombre */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-2xl font-bold text-pink-500">
            ${product.price.toLocaleString('es-AR')}
          </p>
          <h1 className="text-lg font-semibold text-gray-800 mt-1">{product.name}</h1>
        </div>

        {/* Descripción */}
        {product.description && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Detalles */}
        {(product.talle || (product.colores && product.colores.length > 0) || product.store.category === 'accesorios') && (
          <div className="px-4 py-3 flex flex-col gap-2 border-b border-gray-100">
            {product.talle && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">Talle</span>
                <span className="font-semibold text-gray-700 bg-pink-50 border border-pink-100 px-3 py-0.5 rounded-full">
                  {product.talle}
                </span>
              </div>
            )}
            {product.colores && product.colores.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">Color</span>
                <span className="font-semibold text-gray-700">{product.colores.join(', ')}</span>
              </div>
            )}
            {product.store.category === 'accesorios' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">Stock</span>
                <span className="font-semibold text-gray-700">{product.quantity} unidad{product.quantity !== 1 ? 'es' : ''}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón WhatsApp fijo */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-100 max-w-lg mx-auto">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full font-semibold py-3.5 rounded-2xl transition-all
                     bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm
                     shadow-[0_4px_14px_rgba(37,211,102,0.3)]"
        >
          <MessageCircle className="w-5 h-5" />
          Consultar por WhatsApp
        </a>
      </div>
    </main>
  )
}

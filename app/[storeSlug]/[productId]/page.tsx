'use client'

import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import type { Product, Store, ProductMedia, Color } from '@/types'
import { getColorSwatch } from '@/lib/colorSwatches'
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'

type FullProduct = Product & { store: Store; product_media: ProductMedia[]; colors: Color[] }

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
      .select('*, store:stores(*), category:categories(*), product_colors(color:colors(*)), product_media(*)')
      .eq('id', productId)
      .eq('sold', false)
      .single()
      .then(({ data }) => {
        if (!data) {
          setProduct(null)
        } else {
          const { product_colors, ...rest } = data as typeof data & { product_colors: { color: Color }[] }
          setProduct({ ...rest, colors: product_colors.map((pc: { color: Color }) => pc.color) } as FullProduct)
        }
        setLoading(false)
      })
  }, [productId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F6]">
        <div className="w-8 h-8 rounded-full border-2 border-[--border] border-t-[--accent] animate-spin" />
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
    <main className="max-w-lg mx-auto min-h-screen pb-28 bg-[#FAF8F6]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAF8F6]/90 backdrop-blur-md border-b border-[#F0EBED] px-4 py-3">
        <Link
          href={`/${storeSlug}`}
          className="inline-flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--accent] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {product.store.name}
        </Link>
      </header>

      <div className="bg-white border-b border-[#F0EBED]">
        {/* Imagen */}
        {images.length > 0 ? (
          <div className="relative w-full h-72 bg-[--bg-subtle]">
            <Image src={images[mediaIndex]?.url} alt={product.name} fill className="object-contain" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setMediaIndex((i) => Math.max(0, i - 1))}
                  disabled={mediaIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow-sm shadow-[var(--shadow)] disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 text-[--text]" />
                </button>
                <button
                  onClick={() => setMediaIndex((i) => Math.min(images.length - 1, i + 1))}
                  disabled={mediaIndex === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow-sm shadow-[var(--shadow)] disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4 text-[--text]" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMediaIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        i === mediaIndex ? 'bg-[--accent] w-4' : 'bg-[--border] w-1.5'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-[--bg-subtle] flex items-center justify-center text-5xl text-[--border]">
            🛍️
          </div>
        )}

        {video && (
          <div className="w-full bg-black aspect-video">
            <video src={video.url} controls className="w-full h-full object-contain" />
          </div>
        )}

        {/* Precio + nombre */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-2xl font-bold text-[--accent]">
            ${product.price.toLocaleString('es-AR')}
          </p>
          <h1 className="font-serif text-xl text-[--text] mt-1 leading-snug">{product.name}</h1>
        </div>
      </div>

      {/* Detalles */}
      <div className="bg-white mt-2 border-y border-[#F0EBED]">
        {product.description && (
          <div className="px-5 py-4 border-b border-[#F0EBED]">
            <p className="text-sm text-[--text-muted] leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.category && (
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#F0EBED]">
            <span className="text-sm text-[--text-muted]">Categoría</span>
            <span className="text-sm font-semibold text-[--text]">{product.category.name}</span>
          </div>
        )}

        {product.talle && (
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#F0EBED]">
            <span className="text-sm text-[--text-muted]">Talle</span>
            <span className="text-sm font-semibold text-[--text]">{product.talle}</span>
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#F0EBED]">
            <span className="text-sm text-[--text-muted]">Color</span>
            <span className="flex items-center gap-2 flex-wrap justify-end">
              {product.colors.map((c) => (
                <span key={c.id} className="flex items-center gap-1.5 text-sm font-semibold text-[--text]">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                    style={{ backgroundColor: getColorSwatch(c.name) ?? '#E5E7EB' }}
                    aria-hidden="true"
                  />
                  {c.name}
                </span>
              ))}
            </span>
          </div>
        )}

        {product.store.category === 'accesorios' && (
          <div className="px-5 py-3.5 flex items-center justify-between">
            <span className="text-sm text-[--text-muted]">Stock disponible</span>
            <span className="text-sm font-semibold text-[--text]">{product.quantity}</span>
          </div>
        )}
      </div>

      {/* WhatsApp fijo */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4 bg-[#FAF8F6]/95 backdrop-blur border-t border-[--border]">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full font-semibold py-3.5 rounded-xl text-sm
                     bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Consultar por WhatsApp
        </a>
      </div>
    </main>
  )
}

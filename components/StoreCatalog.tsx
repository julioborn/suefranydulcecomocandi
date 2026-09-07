'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, Store, ProductMedia } from '@/types'

type FullProduct = Product & { product_media: ProductMedia[] }

interface Props {
  store: Store
  storeSlug: string
  categoryOrder: string[]
  productsByCategory: Record<string, FullProduct[]>
}

const TODOS = 'Todos'

export default function StoreCatalog({ store, storeSlug, categoryOrder, productsByCategory }: Props) {
  const [selected, setSelected] = useState<string>(TODOS)

  const groups =
    selected === TODOS
      ? categoryOrder.map((cat) => ({ cat, products: productsByCategory[cat] }))
      : [{ cat: selected, products: productsByCategory[selected] ?? [] }]

  const isEmpty = groups.every((g) => g.products.length === 0)

  return (
    <>
      {categoryOrder.length > 1 && (
        <nav className="sticky top-[49px] z-10 bg-[#FAF8F6]/90 backdrop-blur-md border-b border-[--border] px-4 py-2.5 overflow-x-auto">
          <div className="flex gap-2 max-w-4xl mx-auto w-fit">
            {[TODOS, ...categoryOrder].map((cat) => {
              const active = cat === selected
              return (
                <button
                  key={cat}
                  onClick={() => setSelected(cat)}
                  className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 active:scale-95 ${
                    active
                      ? 'bg-[#F0C7D6] border-[#F0C7D6] text-[--accent-dark] font-semibold shadow-sm'
                      : 'bg-white border-[--border] text-[--text-muted] hover:text-[--accent] hover:border-[--accent]'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </nav>
      )}

      <section className="flex-1 px-4 py-6 overflow-hidden">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="font-serif italic text-2xl text-[--text-muted]">Pronto habrá novedades</p>
            <p className="text-sm text-[--text-muted]">Volvé pronto a ver el catálogo</p>
          </div>
        ) : (
          <div key={selected} className="max-w-4xl mx-auto flex flex-col gap-10 animate-catalog-in">
            {groups.map(({ cat, products }) => (
              <div key={cat} className="flex flex-col gap-3">
                <h2 className="font-serif text-xl text-[--text]">
                  {cat}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {products.map((product, i) => {
                    const cover = product.product_media?.find((m) => m.type === 'image')
                    return (
                      <Link
                        key={product.id}
                        href={`/${storeSlug}/${product.id}`}
                        style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                        className="group bg-white rounded-xl overflow-hidden shadow-[var(--shadow)]
                                   hover:shadow-[var(--shadow-hover)] transition-shadow duration-200
                                   animate-card-in"
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
                        <div className="p-3 border-t border-[#F0EBEd]">
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
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

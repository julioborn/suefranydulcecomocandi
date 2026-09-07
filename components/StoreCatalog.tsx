'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product, Store, ProductMedia } from '@/types'
import { Search, X } from 'lucide-react'

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
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()
  const isSearching = query.length > 0

  const groups = isSearching
    ? [{
        cat: 'Resultados',
        products: categoryOrder
          .flatMap((cat) => productsByCategory[cat])
          .filter((p) => p.name.toLowerCase().includes(query)),
      }]
    : selected === TODOS
      ? categoryOrder.map((cat) => ({ cat, products: productsByCategory[cat] }))
      : [{ cat: selected, products: productsByCategory[selected] ?? [] }]

  const isEmpty = groups.every((g) => g.products.length === 0)

  return (
    <>
      <div className="sticky top-[49px] z-10 bg-[#FAF8F6]/90 backdrop-blur-md border-b border-[--border] px-4 py-2.5 flex flex-col gap-2.5">
        <div className="relative max-w-4xl mx-auto w-full">
          <Search className="w-4 h-4 text-[--text-muted] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full text-sm bg-white border border-[--border] rounded-full pl-9 pr-8 py-2
                       text-[--text] placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent]
                       transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--accent] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {categoryOrder.length > 1 && !isSearching && (
          <div className="flex gap-2 max-w-4xl mx-auto w-full overflow-x-auto scrollbar-none">
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
        )}
      </div>

      <section className="flex-1 px-4 py-6 overflow-hidden">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="font-serif italic text-2xl text-[--text-muted]">
              {isSearching ? 'Sin resultados' : 'Pronto habrá novedades'}
            </p>
            <p className="text-sm text-[--text-muted]">
              {isSearching ? `No encontramos nada para "${search.trim()}"` : 'Volvé pronto a ver el catálogo'}
            </p>
          </div>
        ) : (
          <div key={isSearching ? 'search' : selected} className="max-w-4xl mx-auto flex flex-col gap-10 animate-catalog-in">
            {groups.map(({ cat, products }) => (
              <div key={cat} className="flex flex-col gap-3">
                <h2 className="font-serif text-xl text-[--text]">
                  {isSearching ? `Resultados (${products.length})` : cat}
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

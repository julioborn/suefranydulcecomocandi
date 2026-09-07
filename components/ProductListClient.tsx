'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product, Store, ProductMedia } from '@/types'
import { Pencil, Trash2, CheckCircle, Circle, Search, X } from 'lucide-react'

type FullProduct = Product & { product_media: ProductMedia[] }

interface Props {
  initialProducts: FullProduct[]
  store: Store
  storeSlug: string
}

export default function ProductListClient({ initialProducts, store, storeSlug }: Props) {
  const [products, setProducts] = useState<FullProduct[]>(initialProducts)
  const [filter, setFilter] = useState<'activos' | 'vendidos'>('activos')
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()
  const filtered = products.filter((p) => {
    if (filter === 'activos' ? p.sold : !p.sold) return false
    if (query && !p.name.toLowerCase().includes(query)) return false
    return true
  })

  const categoryGroups: { name: string; products: FullProduct[] }[] = []
  const groupIndex = new Map<string, number>()
  for (const product of filtered) {
    const key = product.category?.name ?? 'Sin categoría'
    if (!groupIndex.has(key)) {
      groupIndex.set(key, categoryGroups.length)
      categoryGroups.push({ name: key, products: [] })
    }
    categoryGroups[groupIndex.get(key)!].products.push(product)
  }
  categoryGroups.sort((a, b) => {
    if (a.name === 'Sin categoría') return 1
    if (b.name === 'Sin categoría') return -1
    return a.name.localeCompare(b.name)
  })

  async function toggleSold(product: FullProduct) {
    const supabase = createClient()
    const newSold = !product.sold
    const { error } = await supabase
      .from('products')
      .update({ sold: newSold, sold_at: newSold ? new Date().toISOString() : null })
      .eq('id', product.id)

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, sold: newSold, sold_at: newSold ? new Date().toISOString() : null }
            : p
        )
      )
    }
  }

  async function deleteProduct(product: FullProduct) {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
    const supabase = createClient()

    // Remove files from Storage before deleting the product
    if (product.product_media?.length) {
      const paths = product.product_media.map((m) => {
        const url = new URL(m.url)
        return url.pathname.replace('/storage/v1/object/public/product-media/', '')
      })
      await supabase.storage.from('product-media').remove(paths)
    }

    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== product.id))
  }

  const countActivos = products.filter((p) => !p.sold).length
  const countVendidos = products.filter((p) => p.sold).length

  return (
    <div className="flex flex-col gap-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-pink-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre..."
          className="w-full border border-pink-100 bg-pink-50/30 rounded-xl pl-10 pr-9 py-3 text-sm
                     text-[#4a1942] placeholder:text-pink-200 focus:outline-none focus:border-pink-300
                     focus:bg-white transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-pink-50 rounded-2xl p-1.5 w-fit border border-pink-100">
        {(['activos', 'vendidos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
              filter === tab
                ? 'bg-white text-[#831843] shadow-sm border border-pink-100'
                : 'text-[#c4a0b8] hover:text-[#831843]'
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              filter === tab ? 'bg-pink-50 text-pink-400' : 'text-[#c4a0b8]'
            }`}>
              {tab === 'activos' ? countActivos : countVendidos}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-3xl mb-3">🌸</p>
          <p className="text-[#c4a0b8] text-sm">
            {query
              ? 'No hay productos que coincidan con la búsqueda.'
              : filter === 'activos' ? 'No hay productos activos.' : 'No hay productos vendidos.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {categoryGroups.map((group) => (
            <div key={group.name} className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider">
                {group.name}
              </h2>
              <div className="flex flex-col gap-3">
                {group.products.map((product) => {
                  const cover = product.product_media?.find((m) => m.type === 'image')
                  return (
                    <div
                      key={product.id}
                      className={`card p-4 flex items-center gap-4 transition-all ${
                        product.sold ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Imagen */}
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 flex-shrink-0 ring-1 ring-pink-100">
                        {cover ? (
                          <Image src={cover.url} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#4a1942] truncate">{product.name}</p>
                        <p className="text-pink-500 text-sm font-bold">
                          ${Number(product.price).toLocaleString('es-AR')}
                        </p>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          {store.category === 'ropa' && product.talle && (
                            <span className="text-[10px] bg-pink-50 text-pink-400 border border-pink-100 px-2 py-0.5 rounded-full">
                              Talle {product.talle}
                            </span>
                          )}
                          {store.category === 'accesorios' && (
                            <span className="text-[10px] text-[#c4a0b8]">Stock: {product.quantity}</span>
                          )}
                          {product.sold && product.sold_at && (
                            <span className="text-[10px] text-[#c4a0b8]">
                              Vendido: {new Date(product.sold_at).toLocaleDateString('es-AR')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleSold(product)}
                          title={product.sold ? 'Marcar como disponible' : 'Marcar como vendido'}
                          className={`p-2 rounded-xl transition-all ${
                            product.sold
                              ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-[#c4a0b8] hover:text-pink-400 hover:bg-pink-50'
                          }`}
                        >
                          {product.sold ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>

                        <Link
                          href={`/admin/${storeSlug}/productos/${product.id}/editar`}
                          className="p-2 rounded-xl text-[#c4a0b8] hover:text-pink-500 hover:bg-pink-50 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => deleteProduct(product)}
                          className="p-2 rounded-xl text-[#c4a0b8] hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

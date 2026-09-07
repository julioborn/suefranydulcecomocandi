'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Product, Store, ProductMedia, Category, Color } from '@/types'
import { Upload, X, Plus } from 'lucide-react'

const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único']

interface Props {
  store: Store
  storeSlug: string
  product?: Product & { product_media?: ProductMedia[]; colors?: Color[] }
  initialCategories: Category[]
  initialColors: Color[]
}

const inputClass =
  'border border-pink-100 bg-pink-50/30 rounded-xl px-4 py-3 text-sm text-[#4a1942] placeholder:text-pink-200 focus:outline-none focus:border-pink-300 focus:bg-white transition-all w-full'

const labelClass = 'text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider'

export default function ProductForm({ store, storeSlug, product, initialCategories, initialColors }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [quantity, setQuantity] = useState(product?.quantity?.toString() ?? '1')
  const [categories, setCategories] = useState<Category[]>(
    [...initialCategories].sort((a, b) => a.name.localeCompare(b.name))
  )
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [talle, setTalle] = useState(product?.talle ?? '')
  const [colors, setColors] = useState<Color[]>(
    [...initialColors].sort((a, b) => a.name.localeCompare(b.name))
  )
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>(
    product?.colors?.map((c) => c.id) ?? []
  )
  const [newColorName, setNewColorName] = useState('')
  const [addingColor, setAddingColor] = useState(false)
  const [existingMedia, setExistingMedia] = useState<ProductMedia[]>(product?.product_media ?? [])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newVideo, setNewVideo] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function createCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert({ store_id: store.id, name })
      .select()
      .single()

    if (!error && data) {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(data.id)
      setNewCategoryName('')
      setAddingCategory(false)
    }
  }

  async function createColor() {
    const name = newColorName.trim()
    if (!name) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('colors')
      .insert({ store_id: store.id, name })
      .select()
      .single()

    if (!error && data) {
      setColors((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedColorIds((prev) => [...prev, data.id])
      setNewColorName('')
      setAddingColor(false)
    }
  }

  function toggleColor(id: string) {
    setSelectedColorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleImageFiles(files: FileList | null) {
    if (!files) return
    setNewImages((prev) => [...prev, ...Array.from(files).filter((f) => f.type.startsWith('image/'))])
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-media').upload(path, file)
    if (error) throw error
    return supabase.storage.from('product-media').getPublicUrl(path).data.publicUrl
  }

  async function removeExistingMedia(media: ProductMedia) {
    const supabase = createClient()
    const url = new URL(media.url)
    const path = url.pathname.replace('/storage/v1/object/public/product-media/', '')
    await supabase.storage.from('product-media').remove([path])
    await supabase.from('product_media').delete().eq('id', media.id)
    setExistingMedia((prev) => prev.filter((m) => m.id !== media.id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        store_id: store.id,
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        category_id: categoryId || null,
        talle: store.category === 'ropa' ? (talle || null) : null,
        created_by: user?.id,
      }

      let productId = product?.id

      if (productId) {
        const { error } = await supabase.from('products').update(payload).eq('id', productId)
        if (error) throw error
        await supabase.from('product_colors').delete().eq('product_id', productId)
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single()
        if (error) throw error
        productId = data.id
      }

      if (store.category === 'ropa' && selectedColorIds.length) {
        await supabase.from('product_colors').insert(
          selectedColorIds.map((colorId) => ({ product_id: productId, color_id: colorId }))
        )
      }

      for (let i = 0; i < newImages.length; i++) {
        const url = await uploadFile(newImages[i], `${store.slug}/images`)
        await supabase.from('product_media').insert({
          product_id: productId,
          url,
          type: 'image',
          order_index: existingMedia.length + i,
        })
      }

      if (newVideo) {
        const existingVideo = existingMedia.find((m) => m.type === 'video')
        if (existingVideo) await supabase.from('product_media').delete().eq('id', existingVideo.id)
        const url = await uploadFile(newVideo, `${store.slug}/videos`)
        await supabase.from('product_media').insert({ product_id: productId, url, type: 'video', order_index: 0 })
      }

      router.push(`/admin/${storeSlug}/productos`)
      router.refresh()
    } catch (err) {
      setError('Ocurrió un error al guardar. Intentá de nuevo.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      {/* Nombre */}
      <div className="card p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider">Información básica</h3>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Nombre *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Nombre del producto" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Descripción opcional"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Categoría</label>
          {addingCategory ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); createCategory() }
                  if (e.key === 'Escape') setAddingCategory(false)
                }}
                placeholder="Nombre de la categoría"
                className={`${inputClass} flex-1`}
              />
              <button type="button" onClick={createCategory}
                className="p-3 rounded-xl bg-pink-50 text-pink-400 hover:bg-pink-100 border border-pink-100 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => setAddingCategory(false)}
                className="p-3 rounded-xl text-[#c4a0b8] hover:bg-pink-50 border border-pink-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${inputClass} flex-1`}>
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={() => setAddingCategory(true)}
                title="Nueva categoría"
                className="p-3 rounded-xl bg-pink-50 text-pink-400 hover:bg-pink-100 border border-pink-100 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Precio *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 text-sm font-medium">$</span>
              <input
                type="number" min="0" step="0.01" value={price}
                onChange={(e) => setPrice(e.target.value)} required
                className={`${inputClass} pl-7`} placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={labelClass}>Cantidad *</label>
            <input
              type="number" min="0" value={quantity}
              onChange={(e) => setQuantity(e.target.value)} required
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Campos de ropa */}
      {store.category === 'ropa' && (
        <div className="card p-5 flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider">Detalles de ropa</h3>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Talle</label>
            <select value={talle} onChange={(e) => setTalle(e.target.value)} className={inputClass}>
              <option value="">Sin especificar</option>
              {TALLES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Colores</label>

            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const active = selectedColorIds.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleColor(c.id)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                        active
                          ? 'bg-pink-400 border-pink-400 text-white font-medium'
                          : 'bg-pink-50/30 border-pink-100 text-[#c4a0b8] hover:border-pink-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  )
                })}
              </div>
            )}

            {addingColor ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); createColor() }
                    if (e.key === 'Escape') setAddingColor(false)
                  }}
                  placeholder="Nombre del color"
                  className={`${inputClass} flex-1`}
                />
                <button type="button" onClick={createColor}
                  className="p-3 rounded-xl bg-pink-50 text-pink-400 hover:bg-pink-100 border border-pink-100 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => setAddingColor(false)}
                  className="p-3 rounded-xl text-[#c4a0b8] hover:bg-pink-50 border border-pink-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setAddingColor(true)}
                className="flex items-center gap-1.5 self-start text-sm text-pink-400 hover:text-pink-500 transition-colors">
                <Plus className="w-4 h-4" />
                Nuevo color
              </button>
            )}
          </div>
        </div>
      )}

      {/* Imágenes */}
      <div className="card p-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider">Imágenes y video</h3>

        {existingMedia.filter((m) => m.type === 'image').length > 0 && (
          <div className="flex flex-wrap gap-2">
            {existingMedia.filter((m) => m.type === 'image').map((media) => (
              <div key={media.id} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 group ring-1 ring-pink-100">
                <Image src={media.url} alt="" fill className="object-cover" />
                <button type="button" onClick={() => removeExistingMedia(media)}
                  className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 justify-center border-2 border-dashed border-pink-200
                     rounded-2xl py-5 text-sm text-[#c4a0b8] hover:border-pink-400 hover:text-pink-400
                     hover:bg-pink-50/50 transition-all">
          <Upload className="w-5 h-5" />
          {product ? 'Agregar más imágenes' : 'Subir imágenes'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleImageFiles(e.target.files)} />

        {newImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {newImages.map((file, i) => (
              <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 group ring-1 ring-pink-100">
                <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
                <button type="button" onClick={() => setNewImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={() => videoInputRef.current?.click()}
          className="flex items-center gap-2 justify-center border-2 border-dashed border-pink-100
                     rounded-2xl py-4 text-sm text-[#c4a0b8] hover:border-pink-300 hover:text-pink-400 transition-all">
          <Upload className="w-4 h-4" />
          {newVideo ? newVideo.name : 'Subir video (opcional)'}
        </button>
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
          onChange={(e) => setNewVideo(e.target.files?.[0] ?? null)} />
        {newVideo && (
          <button type="button" onClick={() => setNewVideo(null)}
            className="text-xs text-[#c4a0b8] hover:text-rose-400 text-left transition-colors">
            Quitar video
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-500">{error}</div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.push(`/admin/${storeSlug}/productos`)}
          className="flex-1 border border-pink-100 text-[#c4a0b8] hover:bg-pink-50 hover:text-[#831843]
                     py-3 rounded-2xl text-sm font-semibold transition-all">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 btn-primary py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}

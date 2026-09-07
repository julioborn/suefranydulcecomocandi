'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Store } from '@/types'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'

interface Props {
  store: Store
  initialCategories: Category[]
}

const inputClass =
  'border border-pink-100 bg-pink-50/30 rounded-xl px-4 py-3 text-sm text-[#4a1942] placeholder:text-pink-200 focus:outline-none focus:border-pink-300 focus:bg-white transition-all w-full'

export default function CategoryManager({ store, initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(
    [...initialCategories].sort((a, b) => a.name.localeCompare(b.name))
  )
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')

  async function createCategory(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setError('')
    setCreating(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert({ store_id: store.id, name })
      .select()
      .single()

    if (error) {
      setError(error.code === '23505' ? 'Esa categoría ya existe.' : 'No se pudo crear la categoría.')
    } else if (data) {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
    }
    setCreating(false)
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditingName(category.name)
    setError('')
  }

  async function saveEdit(id: string) {
    const name = editingName.trim()
    if (!name) return
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setError(error.code === '23505' ? 'Esa categoría ya existe.' : 'No se pudo renombrar.')
    } else if (data) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? data : c)).sort((a, b) => a.name.localeCompare(b.name))
      )
      setEditingId(null)
    }
  }

  async function deleteCategory(category: Category) {
    if (!confirm(`¿Eliminar "${category.name}"? Los productos que la tengan quedarán sin categoría.`)) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', category.id)
    if (!error) setCategories((prev) => prev.filter((c) => c.id !== category.id))
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      <form onSubmit={createCategory} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría (ej: Aros)"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="p-3 rounded-xl bg-pink-50 text-pink-400 hover:bg-pink-100 border border-pink-100 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      {categories.length === 0 ? (
        <p className="text-sm text-[#c4a0b8] text-center py-6">Todavía no hay categorías.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 bg-pink-50/40 border border-pink-100 rounded-xl px-4 py-2.5"
            >
              {editingId === category.id ? (
                <>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); saveEdit(category.id) }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    className={`${inputClass} py-1.5`}
                  />
                  <button onClick={() => saveEdit(category.id)} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-[#c4a0b8] hover:bg-pink-100">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-[#4a1942]">{category.name}</span>
                  <button onClick={() => startEdit(category)} className="p-2 rounded-lg text-[#c4a0b8] hover:text-pink-500 hover:bg-pink-100 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCategory(category)} className="p-2 rounded-lg text-[#c4a0b8] hover:text-rose-500 hover:bg-rose-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

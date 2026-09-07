import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Store, Category } from '@/types'
import CategoryManager from '@/components/CategoryManager'

interface PageProps {
  params: Promise<{ storeSlug: string }>
}

export default async function CategoriasPage({ params }: PageProps) {
  const { storeSlug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', storeSlug)
    .single<Store>()

  if (!store) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .order('name')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/admin/${storeSlug}/productos`} className="text-xs text-gray-400 hover:text-[#e8427a]">
          ← Productos
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 mt-1">
          Categorías — {store.name}
        </h1>
      </div>

      <CategoryManager store={store} initialCategories={(categories ?? []) as Category[]} />
    </div>
  )
}

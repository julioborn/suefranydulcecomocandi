import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Store, Color } from '@/types'
import ColorManager from '@/components/ColorManager'

interface PageProps {
  params: Promise<{ storeSlug: string }>
}

export default async function ColoresPage({ params }: PageProps) {
  const { storeSlug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', storeSlug)
    .single<Store>()

  if (!store) notFound()

  const { data: colors } = await supabase
    .from('colors')
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
          Colores — {store.name}
        </h1>
      </div>

      <ColorManager store={store} initialColors={(colors ?? []) as Color[]} />
    </div>
  )
}

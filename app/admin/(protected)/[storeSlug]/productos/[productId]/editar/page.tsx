import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Store, Product, ProductMedia, Category, Color } from '@/types'
import ProductForm from '@/components/ProductForm'

interface PageProps {
  params: Promise<{ storeSlug: string; productId: string }>
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { storeSlug, productId } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', storeSlug)
    .single<Store>()

  if (!store) notFound()

  const { data: productRow } = await supabase
    .from('products')
    .select('*, category:categories(*), product_colors(color:colors(*)), product_media(*)')
    .eq('id', productId)
    .single()

  if (!productRow) notFound()

  const { product_colors, ...rest } = productRow as typeof productRow & {
    product_colors: { color: Color }[]
  }
  const product = {
    ...rest,
    colors: product_colors.map((pc: { color: Color }) => pc.color),
  } as Product & { product_media: ProductMedia[]; colors: Color[] }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .order('name')

  const { data: colors } = await supabase
    .from('colors')
    .select('*')
    .eq('store_id', store.id)
    .order('name')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/${storeSlug}/productos`}
          className="text-xs text-gray-400 hover:text-[#e8427a]"
        >
          ← Productos
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 mt-1">
          Editar — {product.name}
        </h1>
      </div>
      <ProductForm
        store={store}
        storeSlug={storeSlug}
        product={product}
        initialCategories={(categories ?? []) as Category[]}
        initialColors={(colors ?? []) as Color[]}
      />
    </div>
  )
}

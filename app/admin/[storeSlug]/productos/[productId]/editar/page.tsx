import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Store, Product, ProductMedia } from '@/types'
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

  const { data: product } = await supabase
    .from('products')
    .select('*, product_media(*)')
    .eq('id', productId)
    .single<Product & { product_media: ProductMedia[] }>()

  if (!product) notFound()

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
      <ProductForm store={store} storeSlug={storeSlug} product={product} />
    </div>
  )
}

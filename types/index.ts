export type StoreSlug = 'suefran' | 'dulce-como-candi'

export interface Store {
  id: string
  slug: StoreSlug
  name: string
  logo_url: string | null
  whatsapp_number: string
  category: 'ropa' | 'accesorios'
  created_at: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number
  quantity: number
  sold: boolean
  sold_at: string | null
  talle: string | null
  colores: string[] | null
  created_by: string | null
  created_at: string
  updated_at: string
  store?: Store
  product_media?: ProductMedia[]
}

export interface ProductMedia {
  id: string
  product_id: string
  url: string
  type: 'image' | 'video'
  order_index: number
  created_at: string
}

export interface SalesStats {
  store_slug: StoreSlug
  store_name: string
  total_revenue: number
  total_sold: number
  total_active: number
}

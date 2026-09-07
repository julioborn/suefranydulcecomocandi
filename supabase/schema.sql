-- ============================================================
-- SCHEMA: Suefran & Dulce Como Candi
-- ============================================================

-- Tiendas
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  whatsapp_number text not null,
  category text not null check (category in ('ropa', 'accesorios')),
  created_at timestamptz default now()
);

-- Categorías (propias de cada tienda)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique (store_id, name)
);

-- Colores (propios de cada tienda)
create table if not exists colors (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique (store_id, name)
);

-- Productos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  quantity integer not null default 1,
  sold boolean not null default false,
  sold_at timestamptz,
  talle text,
  category_id uuid references categories(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Colores de cada producto (muchos a muchos)
create table if not exists product_colors (
  product_id uuid references products(id) on delete cascade not null,
  color_id uuid references colors(id) on delete cascade not null,
  primary key (product_id, color_id)
);

-- Medios del producto (imágenes y videos)
create table if not exists product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  url text not null,
  type text not null check (type in ('image', 'video')),
  order_index integer default 0,
  created_at timestamptz default now()
);

-- Trigger: actualizar updated_at en products
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- ============================================================
-- RLS
-- ============================================================

alter table stores enable row level security;
alter table categories enable row level security;
alter table colors enable row level security;
alter table products enable row level security;
alter table product_colors enable row level security;
alter table product_media enable row level security;

-- stores: lectura pública, escritura solo autenticados
create policy "stores_public_read" on stores
  for select using (true);

create policy "stores_auth_write" on stores
  for all using (auth.uid() is not null);

-- categories: lectura pública, escritura solo autenticados
create policy "categories_public_read" on categories
  for select using (true);

create policy "categories_auth_write" on categories
  for all using (auth.uid() is not null);

-- colors: lectura pública, escritura solo autenticados
create policy "colors_public_read" on colors
  for select using (true);

create policy "colors_auth_write" on colors
  for all using (auth.uid() is not null);

-- products: lectura pública solo de no vendidos, escritura solo autenticados
create policy "products_public_read" on products
  for select using (true);

create policy "products_auth_write" on products
  for all using (auth.uid() is not null);

-- product_colors: lectura pública, escritura solo autenticados
create policy "product_colors_public_read" on product_colors
  for select using (true);

create policy "product_colors_auth_write" on product_colors
  for all using (auth.uid() is not null);

-- product_media: lectura pública, escritura solo autenticados
create policy "product_media_public_read" on product_media
  for select using (true);

create policy "product_media_auth_write" on product_media
  for all using (auth.uid() is not null);

-- ============================================================
-- STORAGE
-- ============================================================

-- Bucket para medios de productos (crear desde el dashboard o con service role)
-- insert into storage.buckets (id, name, public) values ('product-media', 'product-media', true);

-- Política: lectura pública
-- create policy "product_media_public_read" on storage.objects
--   for select using (bucket_id = 'product-media');

-- Política: subida solo autenticados
-- create policy "product_media_auth_upload" on storage.objects
--   for insert with check (bucket_id = 'product-media' and auth.uid() is not null);

-- create policy "product_media_auth_delete" on storage.objects
--   for delete using (bucket_id = 'product-media' and auth.uid() is not null);

-- ============================================================
-- SEED: las dos tiendas
-- ============================================================

insert into stores (slug, name, logo_url, whatsapp_number, category)
values
  ('suefran', 'Suefran', '/logos/suefran.png', '5493483444875', 'accesorios'),
  ('dulce-como-candi', 'Dulce Como Candi', '/logos/dulcecomocandi.png', '5493483440764', 'ropa')
on conflict (slug) do nothing;

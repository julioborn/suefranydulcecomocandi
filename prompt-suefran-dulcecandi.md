# Proyecto: Catálogo + Administración para Suefran y Dulce Como Candi

## Contexto general

Quiero construir una aplicación web (PWA) que funciona como catálogo público de productos para **dos tiendas**, con un panel de administración privado para las tres dueñas. No hay carrito de compras ni pagos: el cliente solo mira productos y contacta por WhatsApp.

Las dos tiendas:
- **Suefran** → accesorios (Instagram: `@suefran_accesorios`) — WhatsApp: `3483444875`
- **Dulce Como Candi** → ropa (Instagram: `@_dulcecomocandi`) — WhatsApp: `3483440764`

**Dirección física** (compartida por ambas tiendas): Roque Sáenz Peña 1054, Calchaquí, Santa Fe, CP 3050. Mostrarla en el footer del sitio público (y opcionalmente con un link a Google Maps).

Las dueñas: **Victoria, Lucía y Emilia**. Las tres tienen cuenta de administración con los mismos permisos (no hay roles diferenciados por ahora).

### Assets

Los logos de cada tienda van a estar en la carpeta del proyecto (ej. `/public/logos/suefran.png` y `/public/logos/dulcecomocandi.png`) para usar tanto en la landing pública como en el manifest de la PWA. Las cuentas de Instagram de cada tienda pueden servir de referencia visual (paleta de colores, tipografía, estilo de fotos) para el diseño del catálogo.

## Stack tecnológico

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS**
- **Supabase**: base de datos (Postgres), Auth (para las dueñas) y Storage (imágenes y videos de productos)
- **Vercel** para el deploy
- **PWA**: instalable en el celular, con su propio ícono/logo y manifest (definir si el ícono de la PWA es un ícono combinado o el logo de una de las tiendas — a definir con las dueñas, dejar configurable)
- Sin autenticación para el público. Login solo para las dueñas.

## Estructura general de navegación

### Público (sin cuenta, acceso libre)

1. **Landing / Home**: aparecen los dos logos (Suefran y Dulce Como Candi), uno al lado del otro. Al tocar uno, entrás al catálogo de esa tienda.
2. **Catálogo de una tienda**: grilla de productos cargados por las dueñas para esa tienda. Se actualiza en tiempo real (o al menos al recargar) a medida que las dueñas cargan cosas nuevas.
3. **Detalle de producto** (al seleccionar un producto): imagen(es), precio, descripción, y según la tienda: talle/colores (Dulce Como Candi, ropa) o cantidad disponible (Suefran, accesorios).
4. **Botón de WhatsApp** en el detalle del producto: abre `https://wa.me/<numero>?text=<mensaje>` con un mensaje predefinido que incluya el nombre del producto, ej: *"Hola! Me interesa el producto: [nombre del producto] de [nombre de la tienda]"*. El texto debe ir URL-encoded. El número de WhatsApp es distinto por tienda (ver más abajo).

**Importante — Productos vendidos**: cuando una dueña marca un producto como "vendido" desde el panel de administración, ese producto **deja de mostrarse en el catálogo público** (no aparece más en la grilla ni es accesible por URL directa). Sigue existiendo en la base de datos (para las estadísticas e historial de ventas), pero queda oculto para los clientes. En el admin, en cambio, las dueñas sí tienen que poder ver los productos vendidos (ej. en una pestaña o filtro "Vendidos") para consultar el historial.

No hay cuentas de cliente, ni carrito, ni checkout. Todo es solo lectura + el botón de WhatsApp.

### Administración (privado, oculto)

- Ruta no listada en la navegación pública (ej. `/admin` o algo menos obvio como `/panel`), protegida con **Supabase Auth**. Solo las 3 cuentas de las dueñas pueden entrar (whitelist de emails o simplemente porque son las únicas cuentas creadas).
- Middleware de Next.js que redirige a login si no hay sesión válida al entrar a cualquier ruta `/admin/*`.
- Dentro del panel:
  - Selector de tienda (Suefran / Dulce Como Candi) para saber sobre cuál estás trabajando.
  - **ABM de productos** (crear, editar, eliminar) para la tienda seleccionada.
  - Carga de imágenes (y opcionalmente video) por producto vía Supabase Storage.
  - Marcar producto como **vendido / no vendido** con un toggle.
  - **Estadísticas y reportes**: productos vendidos, ingresos totales, ingresos por período (día/semana/mes), productos más vendidos, stock restante por producto, comparación entre las dos tiendas.

## Campos por producto

Todos los productos comparten estos campos base:
- `nombre`
- `descripción`
- `precio`
- `cantidad` (stock disponible)
- `vendido` (boolean) + idealmente `fecha_venta` cuando se marca
- `imagen(es)` (una o varias, subidas a Supabase Storage)
- `video` (opcional, subida a Supabase Storage)
- `tienda` (a cuál de las dos pertenece)
- `fecha_creación`, `creado_por` (qué dueña lo cargó)

Campos específicos de **Dulce Como Candi (ropa)**:
- `talle` (texto o selección: S/M/L/XL, o numérico, a definir)
- `colores` (array de strings, puede ser más de un color por producto/variante)

Campos específicos de **Suefran (accesorios)**: no tiene campos extra más allá de los base (precio, cantidad, vendido, descripción, imagen).

## Modelo de datos sugerido (Supabase / Postgres)

```sql
-- Tiendas
create table stores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,        -- 'suefran' | 'dulce-como-candi'
  name text not null,
  logo_url text,
  whatsapp_number text not null,    -- formato internacional, ej 5493511234567
  category text not null,           -- 'ropa' | 'accesorios'
  created_at timestamptz default now()
);

-- Productos
create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  quantity integer not null default 1,
  sold boolean not null default false,
  sold_at timestamptz,
  talle text,                       -- solo Dulce Como Candi (ropa)
  colores text[],                   -- solo Dulce Como Candi (ropa)
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Imágenes/videos del producto (permite más de una imagen por producto)
create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  type text not null check (type in ('image', 'video')),
  order_index integer default 0,
  created_at timestamptz default now()
);
```

### RLS (Row Level Security)

- `stores`, `products`, `product_media`: **lectura pública** (`select` para `anon`), pero `insert`/`update`/`delete` solo para usuarios autenticados (las dueñas).
- Bucket de Storage: lectura pública, escritura solo autenticada.

## Estadísticas / reportes (panel admin)

Como mínimo:
- Total vendido (monto) por tienda y global, filtrable por rango de fechas.
- Cantidad de productos vendidos por período.
- Productos con más ventas / más consultados (si más adelante se quiere trackear clics al botón de WhatsApp, dejar la puerta abierta pero no es prioridad ahora).
- Stock actual por producto y alertas de bajo stock (opcional, "nice to have").
- Comparación Suefran vs Dulce Como Candi.

Se puede armar con gráficos simples (barras/líneas) usando alguna librería liviana tipo `recharts`.

## PWA

- `manifest.json` con nombre de la app, ícono (definir cuál, ver nota arriba), `theme_color`, `display: standalone`.
- Service worker básico para que sea instalable (no hace falta soporte offline completo, esto es un catálogo que necesita datos frescos).
- Ícono y splash screen configurados para iOS y Android.

## Estructura de carpetas sugerida (Next.js App Router)

```
/app
  /(public)
    /page.tsx                 → landing con los dos logos
    /[storeSlug]/page.tsx     → catálogo de una tienda
    /[storeSlug]/[productId]/page.tsx → detalle de producto
  /admin
    /login/page.tsx
    /page.tsx                 → dashboard / selector de tienda
    /[storeSlug]/productos/page.tsx      → listado + ABM
    /[storeSlug]/productos/nuevo/page.tsx
    /[storeSlug]/productos/[productId]/editar/page.tsx
    /[storeSlug]/estadisticas/page.tsx
  /api (si hace falta algún endpoint server-side, ej. para Storage)
/components
/lib
  /supabase (cliente browser + server)
/types
```

## Notas para el desarrollo

1. Empezar por el modelo de datos en Supabase (tablas + RLS) y la carga del seed de las dos tiendas (`suefran` = accesorios, `dulce-como-candi` = ropa) con sus logos y número de WhatsApp. **Ojo**: `wa.me` necesita el número en formato internacional completo (código de país + código de área + número, sin 0 ni 15). Para Argentina normalmente es `549` + código de área + número (ej. si el número es `3483444875`, probablemente el formato final sea `5493483444875`, pero conviene confirmarlo probando el link real desde el celular antes de dejarlo hardcodeado).
2. Seguir con el panel de admin (login + ABM de productos), porque sin eso no hay contenido para probar la parte pública.
3. Después el catálogo público y el detalle de producto con el botón de WhatsApp.
4. Por último, estadísticas y la configuración de PWA.
5. Mantener el mismo patrón de RLS multi-tenant que ya venimos usando en otros proyectos (Supabase + Next.js).

Con esto como base, quiero que armes la estructura inicial del proyecto Next.js, la configuración de Supabase (esquema SQL incluido) y vayas construyendo primero el panel de administración con el ABM de productos.

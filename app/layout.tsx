import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Suefran & Dulce Como Candi',
  description: 'Catálogo de accesorios y ropa en Calchaquí, Santa Fe.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SDC',
  },
  openGraph: {
    title: 'Suefran & Dulce Como Candi',
    description: 'Catálogo de accesorios y ropa en Calchaquí, Santa Fe.',
    images: [{ url: '/logos/sdc.JPG', width: 1080, height: 1080, alt: 'SDC' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#f472b6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#fdf4f7]">{children}</body>
    </html>
  )
}

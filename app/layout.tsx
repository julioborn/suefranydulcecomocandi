import type { Metadata, Viewport } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import PullToRefresh from '@/components/PullToRefresh'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  style: ['normal', 'italic'],
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
  themeColor: '#FAF8F6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAF8F6] text-[#1C0F14]">
        <PullToRefresh>{children}</PullToRefresh>
      </body>
    </html>
  )
}

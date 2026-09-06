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
    title: 'Catálogo',
  },
}

export const viewport: Viewport = {
  themeColor: '#e8427a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#fff7f9]">{children}</body>
    </html>
  )
}

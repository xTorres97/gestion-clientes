// ============================================================
// Archivo: src/app/layout.tsx (reemplaza el existente)
// ============================================================

import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, DM_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { SWRegister } from '@/components/sw-register'
import './globals.css'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-serif',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
})

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'GestorCobros',
  description: 'Sistema de gestión de clientes y deudas',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GestorCobros',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body className={`${dmSerif.variable} ${dmMono.variable} font-mono antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
        <SWRegister />
      </body>
    </html>
  )
}
// ============================================================
// Archivo: src/app/layout.tsx
// ============================================================

import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
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

export const metadata: Metadata = {
  title: 'GestorCobros',
  description: 'Sistema de gestión de clientes y deudas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${dmSerif.variable} ${dmMono.variable} font-mono antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
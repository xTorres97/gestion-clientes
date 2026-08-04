// ============================================================
// Archivo: src/components/sw-register.tsx
// Componente cliente que registra el service worker
// ============================================================

'use client'

import { useEffect } from 'react'

export function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registrado:', reg.scope))
        .catch((err) => console.error('SW error:', err))
    }
  }, [])

  return null
}
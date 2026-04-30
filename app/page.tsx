// ============================================================
// Archivo: src/app/page.tsx
// Redirige automáticamente según el estado de sesión
// (el middleware maneja la lógica real, esto es solo fallback)
// ============================================================

import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
// ============================================================
// Archivo: src/components/sw-register.tsx
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function SWRegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Capturar el evento de instalación antes de que Chrome lo descarte
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Si ya está instalada, no mostrar el banner
    window.addEventListener('appinstalled', () => {
      setShowBanner(false)
      setInstallPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      setInstallPrompt(null)
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-card border border-amber-500/30 rounded-xl shadow-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Instalar GestorCobros</p>
          <p className="text-xs text-muted-foreground">Accede más rápido desde tu dispositivo</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-xs font-medium transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
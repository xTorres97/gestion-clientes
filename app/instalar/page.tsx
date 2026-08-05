// ============================================================
// Archivo: src/app/instalar/page.tsx
// Página pública de instalación — sin redirección del middleware
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import { CircleDollarSign, Download, CheckCircle2, Smartphone, Monitor } from 'lucide-react'

export default function InstalarPage() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <CircleDollarSign className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl text-foreground">GestorCobros</h1>
            <p className="text-muted-foreground text-sm mt-1">Sistema de gestión de clientes y deudas</p>
          </div>
        </div>

        {installed ? (
          <div className="flex flex-col items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-12 h-12" />
            <p className="text-lg">¡Instalado correctamente!</p>
            <a
              href="/dashboard"
              className="px-6 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium transition-colors"
            >
              Abrir app
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Instrucciones */}
            <div className="rounded-xl border border-border bg-card p-5 text-left space-y-4">
              <div className="flex items-start gap-3">
                <Monitor className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">En PC (Chrome/Edge)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Menú ⋮ → "Instalar GestorCobros" o "Instalar como aplicación"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">En Android (Chrome)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Menú ⋮ → "Añadir a pantalla de inicio"
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">En iPhone (Safari)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Botón compartir □↑ → "Añadir a pantalla de inicio"
                  </p>
                </div>
              </div>
            </div>

            {/* Botón automático si está disponible */}
            {installPrompt && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                Instalar automáticamente
              </button>
            )}

            <a
              href="/login"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continuar en el navegador →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
// ============================================================
// Archivo: src/app/offline/page.tsx  (página sin conexión)
// ============================================================

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
          <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M6.343 17.657a9 9 0 010-12.728M9.172 14.828a5 5 0 010-7.072" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif text-foreground">Sin conexión</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          GestorCobros necesita conexión a internet para funcionar. Verifica tu red e intenta de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
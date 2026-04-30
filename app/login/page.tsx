// ============================================================
// Archivo: src/app/login/page.tsx
// ============================================================

'use client'

import { useState, useTransition } from 'react'
import { login } from '@/lib/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-amber-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-amber-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-amber-500/8" />
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo / Título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl text-foreground mb-1">GestorCobros</h1>
          <p className="text-muted-foreground text-sm font-mono">
            Sistema de gestión de deudas
          </p>
        </div>

        {/* Formulario */}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@empresa.com"
                className="pl-9 bg-card border-border focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="pl-9 bg-card border-border focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-medium mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Solo usuarios autorizados
        </p>
      </div>
    </div>
  )
}
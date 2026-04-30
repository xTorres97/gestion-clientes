// ============================================================
// Archivo: src/components/users/create-user-dialog.tsx
// ============================================================

'use client'

import { useState, useTransition } from 'react'
import { createUser } from '@/lib/actions/auth.actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Loader2, UserCog, Eye, EyeOff } from 'lucide-react'

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const email = data.get('email') as string
    const password = data.get('password') as string
    const full_name = data.get('full_name') as string

    if (!email || !password || password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    startTransition(async () => {
      const result = await createUser({ email, password, full_name })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Usuario "${email}" creado exitosamente`)
        setOpen(false)
        form.reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Sin asChild: evita button anidado dentro de button */}
      <DialogTrigger
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nuevo usuario
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-amber-400" />
            </div>
            <DialogTitle className="text-xl">Crear usuario</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            El usuario se creará con rol de operador. Podrá gestionar clientes pero no crear más usuarios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-xs uppercase tracking-widest text-muted-foreground">
              Nombre completo
            </Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="María García"
              required
              className="bg-secondary border-border focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="operador@empresa.com"
              required
              className="bg-secondary border-border focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="pr-9 bg-secondary border-border focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear usuario'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
// ============================================================
// Archivo: src/components/clients/add-client-dialog.tsx
// ============================================================

'use client'

import { useState, useTransition } from 'react'
import { createClient_ } from '@/lib/actions/clients.actions'
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
import { Plus, Loader2, UserPlus } from 'lucide-react'

export function AddClientDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const fullName = data.get('full_name') as string
    const debtAmount = parseFloat(data.get('debt_amount') as string)
    const notes = data.get('notes') as string

    if (!fullName.trim() || isNaN(debtAmount) || debtAmount <= 0) {
      toast.error('Completa todos los campos correctamente')
      return
    }

    startTransition(async () => {
      const result = await createClient_({ full_name: fullName, debt_amount: debtAmount, notes })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Cliente "${fullName}" agregado exitosamente`)
        setOpen(false)
        form.reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Sin asChild: DialogTrigger renderiza su propio elemento, no anida buttons */}
      <DialogTrigger
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nuevo cliente
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-amber-400" />
            </div>
            <DialogTitle className="text-xl">Agregar cliente</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Registra un nuevo cliente con su deuda pendiente.
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
              placeholder="Juan Pérez"
              required
              className="bg-secondary border-border focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="debt_amount" className="text-xs uppercase tracking-widest text-muted-foreground">
              Monto de la deuda
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="debt_amount"
                name="debt_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                required
                className="pl-7 bg-secondary border-border focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs uppercase tracking-widest text-muted-foreground">
              Notas <span className="text-muted-foreground/50 normal-case tracking-normal">(opcional)</span>
            </Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Observaciones adicionales..."
              className="bg-secondary border-border focus:border-amber-500/50"
            />
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
                  Guardando...
                </>
              ) : (
                'Agregar cliente'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
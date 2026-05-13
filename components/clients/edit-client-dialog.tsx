// ============================================================
// Archivo: src/components/clients/edit-client-dialog.tsx
// ============================================================

'use client'

import { useTransition } from 'react'
import { updateClient } from '@/lib/actions/clients.actions'
import type { ClientWithStats } from '@/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Loader2, Pencil } from 'lucide-react'

interface EditClientDialogProps {
  client: ClientWithStats
  open: boolean
  onClose: () => void
}

export function EditClientDialog({ client, open, onClose }: EditClientDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    const full_name = (data.get('full_name') as string).trim()
    const monthly_amount = parseFloat(data.get('monthly_amount') as string)
    const payment_day = parseInt(data.get('payment_day') as string)
    const notes = (data.get('notes') as string).trim()

    if (!full_name) {
      toast.error('El nombre no puede estar vacío')
      return
    }
    if (isNaN(monthly_amount) || monthly_amount <= 0) {
      toast.error('El monto mensual debe ser mayor a 0')
      return
    }
    if (payment_day < 1 || payment_day > 28) {
      toast.error('El día de pago debe estar entre 1 y 28')
      return
    }

    startTransition(async () => {
      const result = await updateClient(client.id, {
        full_name,
        monthly_amount,
        payment_day,
        notes,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cliente actualizado correctamente')
        onClose()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-amber-400" />
            </div>
            <DialogTitle className="text-xl">Editar cliente</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Modifica los datos de{' '}
            <span className="text-foreground font-medium">{client.full_name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="edit_full_name" className="text-xs uppercase tracking-widest text-muted-foreground">
              Nombre completo
            </Label>
            <Input
              id="edit_full_name"
              name="full_name"
              defaultValue={client.full_name}
              required
              className="bg-secondary border-border focus:border-amber-500/50"
            />
          </div>

          {/* Monto y día */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit_monthly_amount" className="text-xs uppercase tracking-widest text-muted-foreground">
                Monto mensual
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="edit_monthly_amount"
                  name="monthly_amount"
                  type="number"
                  min="1"
                  step="0.01"
                  defaultValue={client.monthly_amount}
                  required
                  className="pl-7 bg-secondary border-border focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit_payment_day" className="text-xs uppercase tracking-widest text-muted-foreground">
                Día de pago
              </Label>
              <Input
                id="edit_payment_day"
                name="payment_day"
                type="number"
                min="1"
                max="28"
                defaultValue={client.payment_day}
                required
                className="bg-secondary border-border focus:border-amber-500/50"
              />
              <p className="text-[10px] text-muted-foreground">Día del mes (1–28)</p>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <Label htmlFor="edit_notes" className="text-xs uppercase tracking-widest text-muted-foreground">
              Notas{' '}
              <span className="normal-case tracking-normal text-muted-foreground/50">(opcional)</span>
            </Label>
            <Input
              id="edit_notes"
              name="notes"
              defaultValue={client.notes ?? ''}
              placeholder="Observaciones..."
              className="bg-secondary border-border focus:border-amber-500/50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
                : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
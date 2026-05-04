// ============================================================
// Archivo: src/components/clients/prepaid-dialog.tsx
// ============================================================

'use client'

import { useState, useTransition } from 'react'
import { addPrepaidMonths } from '@/lib/actions/clients.actions'
import type { ClientWithStats } from '@/types'
import { formatCurrency } from '@/lib/utils'
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
import { Loader2, CalendarCheck, CircleDollarSign } from 'lucide-react'

interface PrepaidDialogProps {
  client: ClientWithStats
  open: boolean
  onClose: () => void
}

export function PrepaidDialog({ client, open, onClose }: PrepaidDialogProps) {
  const [months, setMonths] = useState(1)
  const [isPending, startTransition] = useTransition()

  const total = months * client.monthly_amount

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (months < 1) {
      toast.error('Ingresa al menos 1 mes')
      return
    }

    startTransition(async () => {
      const result = await addPrepaidMonths(client.id, months)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          `${months} mes${months > 1 ? 'es' : ''} prepagado${months > 1 ? 's' : ''} registrado${months > 1 ? 's' : ''} para ${client.full_name}`
        )
        onClose()
        setMonths(1)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl">Pago múltiple</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">{client.full_name}</span> — pago de varios meses de una vez.
            Los meses registrados se descontarán antes de generar nuevas deudas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="months" className="text-xs uppercase tracking-widest text-muted-foreground">
              Meses pagados
            </Label>
            <Input
              id="months"
              type="number"
              min="1"
              max="24"
              value={months}
              onChange={(e) => setMonths(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-secondary border-border focus:border-emerald-500/50 text-center text-lg font-mono"
            />
          </div>

          {/* Resumen */}
          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto mensual</span>
              <span className="font-mono">{formatCurrency(client.monthly_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Meses</span>
              <span className="font-mono">× {months}</span>
            </div>
            <div className="border-t border-emerald-500/20 pt-2 flex justify-between">
              <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                <CircleDollarSign className="w-3.5 h-3.5" />
                Total cobrado
              </span>
              <span className="font-mono text-emerald-400 font-medium">{formatCurrency(total)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Los próximos <span className="text-foreground">{months}</span> mes{months > 1 ? 'es' : ''} no se cobrarán a este cliente.
            {client.prepaid_months > 0 && (
              <> Ya tiene <span className="text-amber-400">{client.prepaid_months}</span> mes{client.prepaid_months > 1 ? 'es' : ''} prepagado{client.prepaid_months > 1 ? 's' : ''}.</>
            )}
          </p>

          <div className="flex gap-3">
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrando...</>
              ) : (
                'Registrar pago'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
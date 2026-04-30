'use client'

import { useState, useTransition } from 'react'
import { addPayment } from '@/lib/actions/clients.actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AddPaymentDialog({ clientId }: { clientId: string }) {
  const [amount, setAmount] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    const value = Number(amount)
    if (!value || value <= 0) return

    startTransition(async () => {
      await addPayment(clientId, value)
      setAmount('')
    })
  }

  return (
    <Dialog>
    <DialogTrigger>
    <Button size="sm">Abonar</Button>
    </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
// ============================================================
// Archivo: src/components/clients/debtors-actions.tsx
// Componente cliente para el botón de marcar pagado en morosos
// ============================================================

'use client'

import { useTransition } from 'react'
import { markPaymentPaid } from '@/lib/actions/clients.actions'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

interface DebtorsActionsProps {
  paymentId: string
  dueDate: string
}

export function DebtorsActions({ paymentId, dueDate }: DebtorsActionsProps) {
  const [isPending, startTransition] = useTransition()

  function handleMarkPaid() {
    startTransition(async () => {
      const result = await markPaymentPaid(paymentId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Pago de ${formatDate(dueDate)} registrado`)
      }
    })
  }

  return (
    <button
      onClick={handleMarkPaid}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
    >
      <CheckCircle2 className="w-3 h-3" />
      Marcar pagado
    </button>
  )
}
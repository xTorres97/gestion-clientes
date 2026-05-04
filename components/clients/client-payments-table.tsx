// ============================================================
// Archivo: src/components/clients/client-payments-table.tsx
// ============================================================

'use client'

import { useTransition } from 'react'
import { markPaymentPaid } from '@/lib/actions/clients.actions'
import type { PaymentWithStatus } from '@/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

interface ClientPaymentsTableProps {
  payments: PaymentWithStatus[]
}

export function ClientPaymentsTable({ payments }: ClientPaymentsTableProps) {
  const [isPending, startTransition] = useTransition()

  function handleMarkPaid(payment: PaymentWithStatus) {
    startTransition(async () => {
      const result = await markPaymentPaid(payment.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Pago de ${formatDate(payment.due_date)} marcado como pagado`)
      }
    })
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Período</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Monto</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Estado</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Fecha de pago</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Cobrado por</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                No hay pagos registrados aún
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow
                key={payment.id}
                className={cn(
                  'border-border transition-colors',
                  payment.is_overdue ? 'bg-red-500/5 hover:bg-red-500/8' :
                  payment.is_paid ? 'hover:bg-emerald-500/5' : 'hover:bg-secondary/30'
                )}
              >
                <TableCell className="font-mono text-sm">
                  {formatDate(payment.due_date)}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'font-mono text-sm',
                    payment.is_paid ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}>
                    {formatCurrency(payment.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  {payment.is_paid ? (
                    <Badge variant="outline" className="text-xs gap-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      <CheckCircle2 className="w-3 h-3" />
                      Pagado
                    </Badge>
                  ) : payment.is_overdue ? (
                    <Badge variant="outline" className="text-xs gap-1.5 border-red-500/30 text-red-400 bg-red-500/10">
                      <AlertTriangle className="w-3 h-3" />
                      Mora · {payment.days_overdue}d
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs gap-1.5 border-amber-500/30 text-amber-400 bg-amber-500/10">
                      <Clock className="w-3 h-3" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {payment.paid_at ? formatDate(payment.paid_at) : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payment.paid_by_name || payment.paid_by_email || '—'}
                </TableCell>
                <TableCell className="text-right">
                  {!payment.is_paid && (
                    <button
                      onClick={() => handleMarkPaid(payment)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Marcar pagado
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
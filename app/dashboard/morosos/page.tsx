// ============================================================
// Archivo: src/app/dashboard/morosos/page.tsx
// ============================================================

import { getDebtors } from '@/lib/actions/clients.actions'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { DebtorsActions } from '@/components/clients/debtors-actions'

export default async function MorososPage() {
  const result = await getDebtors()
  const debtors = result.data ?? []
  const totalDebt = debtors.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-widest text-red-400/70 mb-1">Requieren atención</p>
        <h1 className="text-4xl text-foreground flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          Morosos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pagos con más de 3 días de retraso
        </p>
      </div>

      {debtors.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5 animate-fade-up-delay-1 animate-fade-up">
          <CardContent className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4" />
              {debtors.length} pago{debtors.length > 1 ? 's' : ''} en mora
            </div>
            <span className="font-mono text-lg text-red-400">{formatCurrency(totalDebt)}</span>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border border-red-500/15 overflow-hidden animate-fade-up-delay-2 animate-fade-up">
        <Table>
          <TableHeader>
            <TableRow className="border-red-500/15 bg-red-500/5 hover:bg-red-500/5">
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Cliente</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Período</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Monto</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Días en mora</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/40" />
                    <p className="text-sm">¡Sin morosos! Todos al día.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              debtors.map((payment) => (
                <TableRow key={payment.id} className="border-red-500/10 hover:bg-red-500/8 transition-colors">
                  <TableCell>
                    <Link
                      href={`/dashboard/clientes/${payment.client_id}`}
                      className="text-sm text-foreground hover:text-amber-400 transition-colors"
                    >
                      {payment.client_name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {formatDate(payment.due_date)}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-red-400">
                      {formatCurrency(payment.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs gap-1.5 border-red-500/30 bg-red-500/10',
                        payment.days_overdue > 10 ? 'text-red-300' : 'text-red-400'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {payment.days_overdue} día{payment.days_overdue !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DebtorsActions paymentId={payment.id} dueDate={payment.due_date} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
// ============================================================
// Archivo: src/app/dashboard/clientes/[id]/page.tsx
// ============================================================

import { getClientPayments, getClients } from '@/lib/actions/clients.actions'
import { getCurrentProfile } from '@/lib/actions/auth.actions'
import { ClientPaymentsTable } from '@/components/clients/client-payments-table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react'
import Link from 'next/link'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const [clientsResult, paymentsResult, profile] = await Promise.all([
    getClients(),
    getClientPayments(params.id),
    getCurrentProfile(),
  ])

  const client = clientsResult.data?.find((c) => c.id === params.id)
  if (!client) notFound()

  const payments = paymentsResult.data ?? []
  const pendingPayments = payments.filter((p) => !p.is_paid)
  const paidPayments = payments.filter((p) => p.is_paid)
  const overduePayments = payments.filter((p) => p.is_overdue)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <Link
          href="/dashboard/clientes"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a clientes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Detalle de cliente</p>
            <h1 className="text-4xl text-foreground">{client.full_name}</h1>
            {client.notes && (
              <p className="text-muted-foreground text-sm mt-1">{client.notes}</p>
            )}
          </div>
          {overduePayments.length > 0 && (
            <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {overduePayments.length} en mora
            </Badge>
          )}
        </div>
      </div>

      {/* Stats del cliente */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-up-delay-1 animate-fade-up">
        {[
          {
            label: 'Monto mensual',
            value: formatCurrency(client.monthly_amount),
            icon: CircleDollarSign,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'Día de pago',
            value: `Día ${client.payment_day}`,
            icon: CalendarDays,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            label: 'Pendientes',
            value: `${pendingPayments.length} pagos`,
            icon: AlertTriangle,
            color: pendingPayments.length > 0 ? 'text-red-400' : 'text-muted-foreground',
            bg: pendingPayments.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-secondary border-border',
          },
          {
            label: 'Meses prepagados',
            value: client.prepaid_months > 0 ? `+${client.prepaid_months} mes${client.prepaid_months > 1 ? 'es' : ''}` : 'Ninguno',
            icon: CalendarCheck,
            color: client.prepaid_months > 0 ? 'text-emerald-400' : 'text-muted-foreground',
            bg: client.prepaid_months > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-secondary border-border',
          },
        ].map((stat) => (
          <Card key={stat.label} className={`border ${stat.bg} bg-card`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
                  <p className={`text-lg font-mono font-medium ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-2 rounded-md ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla de pagos */}
      <div className="animate-fade-up-delay-2 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono text-foreground">
            Historial de pagos
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {paidPayments.length} pagados
            <span className="text-border">·</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            {pendingPayments.length} pendientes
          </div>
        </div>
        <ClientPaymentsTable payments={payments} />
      </div>
    </div>
  )
}
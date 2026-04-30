// ============================================================
// Archivo: src/app/dashboard/page.tsx
// ============================================================

import { getClients, getDebtors } from '@/lib/actions/clients.actions'
import { getCurrentProfile } from '@/lib/actions/auth.actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const [clientsResult, debtorsResult, profile] = await Promise.all([
    getClients(),
    getDebtors(),
    getCurrentProfile(),
  ])

  const clients = clientsResult.data ?? []
  const debtors = debtorsResult.data ?? []

  const totalClients = clients.length
  const totalDebtors = debtors.length
  const totalPaid = clients.filter((c) => c.is_paid).length
  const totalDebt = debtors.reduce((sum, c) => sum + c.debt_amount, 0)
  const totalRecovered = clients
    .filter((c) => c.is_paid)
    .reduce((sum, c) => sum + c.debt_amount, 0)

  // Últimos 5 morosos más antiguos
  const oldestDebtors = debtors.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Panel principal</p>
        <h1 className="text-4xl text-foreground">
          Bienvenido{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Total clientes',
            value: totalClients,
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
            delay: 'animate-fade-up-delay-1',
          },
          {
            label: 'Morosos',
            value: totalDebtors,
            icon: AlertTriangle,
            color: 'text-red-400',
            bg: 'bg-red-500/10 border-red-500/20',
            delay: 'animate-fade-up-delay-2',
          },
          {
            label: 'Al día',
            value: totalPaid,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            delay: 'animate-fade-up-delay-3',
          },
          {
            label: 'Deuda pendiente',
            value: formatCurrency(totalDebt),
            icon: TrendingUp,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
            delay: 'animate-fade-up-delay-4',
          },
        ].map((stat) => (
          <Card key={stat.label} className={`border ${stat.bg} bg-card ${stat.delay} animate-fade-up`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-mono font-medium ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fila inferior */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Morosos recientes */}
        <Card className="border-border bg-card animate-fade-up-delay-3 animate-fade-up">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 font-mono font-normal">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Morosos más antiguos
              </CardTitle>
              <Link href="/dashboard/morosos">
                <Badge variant="outline" className="text-xs border-border hover:border-amber-500/30 hover:text-amber-400 transition-colors cursor-pointer">
                  Ver todos
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {oldestDebtors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mb-3 text-emerald-500/40" />
                <p className="text-sm">No hay morosos</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {oldestDebtors.map((client) => (
                  <div key={client.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{client.full_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Desde {formatDate(client.debt_date)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-red-400 shrink-0 ml-4">
                      {formatCurrency(client.debt_amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de recuperación */}
        <Card className="border-border bg-card animate-fade-up-delay-4 animate-fade-up">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base flex items-center gap-2 font-mono font-normal">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Resumen financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Total deuda pendiente</span>
              <span className="font-mono text-red-400">{formatCurrency(totalDebt)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Total recuperado</span>
              <span className="font-mono text-emerald-400">{formatCurrency(totalRecovered)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-muted-foreground">Total gestionado</span>
              <span className="font-mono text-amber-400">{formatCurrency(totalDebt + totalRecovered)}</span>
            </div>

            {/* Barra de progreso */}
            {totalDebt + totalRecovered > 0 && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Tasa de recuperación</span>
                  <span className="text-emerald-400">
                    {Math.round((totalRecovered / (totalDebt + totalRecovered)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.round((totalRecovered / (totalDebt + totalRecovered)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
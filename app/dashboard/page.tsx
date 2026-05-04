// ============================================================
// Archivo: src/app/dashboard/page.tsx
// ============================================================

import { getClients, getDebtors } from '@/lib/actions/clients.actions'
import { getCurrentProfile } from '@/lib/actions/auth.actions'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, AlertTriangle, CheckCircle2, TrendingUp, Clock, CalendarDays } from 'lucide-react'
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
  const totalDebtPayments = debtors.length
  const clientsWithDebt = new Set(debtors.map((d) => d.client_id)).size
  const totalDebt = debtors.reduce((sum, p) => sum + p.amount, 0)
  const clientsUpToDate = clients.filter((c) => c.overdue_payments === 0 && c.pending_payments === 0).length

  // Top 5 morosos más antiguos
  const worstDebtors = debtors.slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Panel principal</p>
        <h1 className="text-4xl text-foreground">
          Bienvenido{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
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
            label: 'Clientes en mora',
            value: clientsWithDebt,
            icon: AlertTriangle,
            color: 'text-red-400',
            bg: 'bg-red-500/10 border-red-500/20',
            delay: 'animate-fade-up-delay-2',
          },
          {
            label: 'Al día',
            value: clientsUpToDate,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            delay: 'animate-fade-up-delay-3',
          },
          {
            label: 'Deuda en mora',
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
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
                  <p className={`text-2xl font-mono font-medium ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-2 rounded-md ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagos en mora + Próximos pagos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-border bg-card animate-fade-up-delay-3 animate-fade-up">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 font-mono font-normal">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Pagos en mora
              </CardTitle>
              <Link href="/dashboard/morosos">
                <Badge variant="outline" className="text-xs border-border hover:border-amber-500/30 hover:text-amber-400 transition-colors cursor-pointer">
                  Ver todos
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {worstDebtors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mb-3 text-emerald-500/40" />
                <p className="text-sm">Sin pagos en mora</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {worstDebtors.map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/dashboard/clientes/${payment.client_id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-red-500/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{payment.client_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-red-400/60" />
                        <p className="text-xs text-red-400/70">
                          {payment.days_overdue} día{payment.days_overdue !== 1 ? 's' : ''} en mora
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-red-400 shrink-0 ml-4">
                      {formatCurrency(payment.amount)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clientes con pago próximo (en los próximos 5 días) */}
        <Card className="border-border bg-card animate-fade-up-delay-4 animate-fade-up">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base flex items-center gap-2 font-mono font-normal">
              <CalendarDays className="w-4 h-4 text-amber-400" />
              Próximos vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(() => {
              const today = new Date()
              const in5days = new Date()
              in5days.setDate(in5days.getDate() + 5)
              const todayDay = today.getDate()
              const upcoming = clients.filter((c) => {
                const d = c.payment_day
                return d >= todayDay && d <= todayDay + 5 && c.pending_payments === 0 && c.prepaid_months === 0
              }).slice(0, 5)

              if (upcoming.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CalendarDays className="w-8 h-8 mb-3 text-amber-500/30" />
                    <p className="text-sm">Sin vencimientos próximos</p>
                  </div>
                )
              }

              return (
                <div className="divide-y divide-border">
                  {upcoming.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clientes/${client.id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-amber-500/5 transition-colors"
                    >
                      <div>
                        <p className="text-sm text-foreground">{client.full_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Vence el día {client.payment_day}</p>
                      </div>
                      <p className="text-sm font-mono text-amber-400">
                        {formatCurrency(client.monthly_amount)}
                      </p>
                    </Link>
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
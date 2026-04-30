// ============================================================
// Archivo: src/app/dashboard/morosos/page.tsx
// ============================================================

import { getDebtors } from '@/lib/actions/clients.actions'
import { getCurrentProfile } from '@/lib/actions/auth.actions'
import { DebtorsTable } from '@/components/clients/debtors-table'
import { AlertTriangle } from 'lucide-react'

export default async function MorososPage() {
  const [debtorsResult, profile] = await Promise.all([
    getDebtors(),
    getCurrentProfile(),
  ])

  const debtors = debtorsResult.data ?? []
  const totalDebt = debtors.reduce((sum, c) => sum + c.debt_amount, 0)

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-widest text-red-400/70 mb-1">Pendientes de pago</p>
        <h1 className="text-4xl text-foreground flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          Morosos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {debtors.length} cliente{debtors.length !== 1 ? 's' : ''} con deuda pendiente
        </p>
      </div>

      <div className="animate-fade-up-delay-1 animate-fade-up">
        <DebtorsTable debtors={debtors} isAdmin={profile?.role === 'admin'} totalDebt={totalDebt} />
      </div>
    </div>
  )
}
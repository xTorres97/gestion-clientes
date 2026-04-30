// ============================================================
// Archivo: src/app/dashboard/clientes/page.tsx
// ============================================================

import { getClients } from '@/lib/actions/clients.actions'
import { getCurrentProfile } from '@/lib/actions/auth.actions'
import { ClientsTable } from '@/components/clients/clients-table'
import { AddClientDialog } from '@/components/clients/add-client-dialog'
import { Users } from 'lucide-react'

export default async function ClientesPage() {
  const [clientsResult, profile] = await Promise.all([
    getClients(),
    getCurrentProfile(),
  ])

  const clients = clientsResult.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Gestión</p>
          <h1 className="text-4xl text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-muted-foreground" />
            Clientes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddClientDialog />
      </div>

      <div className="animate-fade-up-delay-1 animate-fade-up">
        <ClientsTable clients={clients} isAdmin={profile?.role === 'admin'} />
      </div>
    </div>
  )
}
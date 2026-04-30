// ============================================================
// Archivo: src/app/dashboard/usuarios/page.tsx
// ============================================================

import { getAllUsers, getCurrentProfile } from '@/lib/actions/auth.actions'
import { redirect } from 'next/navigation'
import { UsersTable } from '@/components/users/users-table'
import { CreateUserDialog } from '@/components/users/create-user-dialog'
import { UserCog } from 'lucide-react'

export default async function UsuariosPage() {
  const profile = await getCurrentProfile()

  // Solo el admin puede acceder
  if (profile?.role !== 'admin') redirect('/dashboard')

  const usersResult = await getAllUsers()
  const users = (usersResult.data ?? []).filter((u) => u.id !== profile.id)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">Administración</p>
          <h1 className="text-4xl text-foreground flex items-center gap-3">
            <UserCog className="w-8 h-8 text-muted-foreground" />
            Usuarios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="animate-fade-up-delay-1 animate-fade-up">
        <UsersTable users={users} currentUserId={profile.id} />
      </div>
    </div>
  )
}
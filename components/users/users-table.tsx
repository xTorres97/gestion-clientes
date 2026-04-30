// ============================================================
// Archivo: src/components/users/users-table.tsx
// ============================================================

'use client'

import { useTransition } from 'react'
import { toggleUserAccess } from '@/lib/actions/auth.actions'
import type { Profile } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShieldCheck, ShieldOff, UserCheck, UserX, Calendar } from 'lucide-react'

interface UsersTableProps {
  users: Profile[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggleAccess(user: Profile) {
    const action = user.is_active ? 'revocar' : 'activar'
    if (!confirm(`¿Deseas ${action} el acceso de ${user.full_name || user.email}?`)) return

    startTransition(async () => {
      const result = await toggleUserAccess(user.id, !user.is_active)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          user.is_active
            ? `Acceso revocado a ${user.full_name || user.email}`
            : `Acceso activado para ${user.full_name || user.email}`
        )
      }
    })
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Usuario</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Rol</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Estado</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Creado</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal text-right">Acceso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                No hay otros usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className={cn(
                  'border-border transition-colors',
                  !user.is_active && 'opacity-50',
                  'hover:bg-secondary/30'
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                      user.is_active
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                        : 'bg-secondary border border-border text-muted-foreground'
                    )}>
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{user.full_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs gap-1',
                      user.role === 'admin'
                        ? 'border-amber-500/30 text-amber-400'
                        : 'border-border text-muted-foreground'
                    )}
                  >
                    {user.role === 'admin' ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <ShieldOff className="w-3 h-3" />
                    )}
                    {user.role === 'admin' ? 'Admin' : 'Operador'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs gap-1.5',
                      user.is_active
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                        : 'border-red-500/30 text-red-400 bg-red-500/5'
                    )}
                  >
                    {user.is_active ? (
                      <UserCheck className="w-3 h-3" />
                    ) : (
                      <UserX className="w-3 h-3" />
                    )}
                    {user.is_active ? 'Activo' : 'Sin acceso'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Calendar className="w-3 h-3" />
                    {formatDate(user.created_at)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {user.id !== currentUserId && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleToggleAccess(user)}
                      className={cn(
                        'text-xs h-7 border',
                        user.is_active
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50'
                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50'
                      )}
                    >
                      {user.is_active ? (
                        <>
                          <UserX className="w-3 h-3 mr-1.5" />
                          Revocar acceso
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 mr-1.5" />
                          Activar acceso
                        </>
                      )}
                    </Button>
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
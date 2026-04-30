// ============================================================
// Archivo: src/components/clients/clients-table.tsx
// ============================================================

'use client'

import { useState, useTransition, useMemo } from 'react'
import { togglePaymentStatus, deleteClient } from '@/lib/actions/clients.actions'
import type { Client } from '@/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, CheckCircle2, Clock, MoreHorizontal, Trash2, RotateCcw } from 'lucide-react'

interface ClientsTableProps {
  clients: Client[]
  isAdmin: boolean
}

export function ClientsTable({ clients, isAdmin }: ClientsTableProps) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const q = search.toLowerCase()
    return clients.filter((c) => c.full_name.toLowerCase().includes(q))
  }, [clients, search])

  function handleTogglePayment(client: Client) {
    startTransition(async () => {
      const newStatus = !client.is_paid
      const result = await togglePaymentStatus(client.id, newStatus)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(newStatus ? `${client.full_name} marcado como pagado` : `${client.full_name} marcado como pendiente`)
      }
    })
  }

  function handleDelete(client: Client) {
    if (!confirm(`¿Eliminar a ${client.full_name}? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const result = await deleteClient(client.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cliente eliminado')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border max-w-sm"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Cliente</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Deuda</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Estado</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Fecha inicio</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Fecha pago</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                  {search ? 'Sin resultados para esa búsqueda' : 'No hay clientes registrados'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className={cn(
                    'border-border transition-colors',
                    client.is_paid ? 'hover:bg-emerald-500/5' : 'hover:bg-red-500/5'
                  )}
                >
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{client.full_name}</p>
                      {client.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {client.notes}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'font-mono text-sm',
                      client.is_paid ? 'text-muted-foreground line-through' : 'text-red-400'
                    )}>
                      {formatCurrency(client.debt_amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs gap-1.5',
                        client.is_paid
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : 'border-red-500/30 text-red-400 bg-red-500/10'
                      )}
                    >
                      {client.is_paid ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {client.is_paid ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {formatDate(client.debt_date)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {client.is_paid ? formatDate(client.paid_at) : '—'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      {/* Sin asChild: DropdownMenuTrigger renderiza su propio button */}
                      <DropdownMenuTrigger
                        disabled={isPending}
                        className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          onClick={() => handleTogglePayment(client)}
                          className="text-sm gap-2 cursor-pointer"
                        >
                          {client.is_paid ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              Marcar como pendiente
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Marcar como pagado
                            </>
                          )}
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(client)}
                              className="text-sm gap-2 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Eliminar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>
      )}
    </div>
  )
}
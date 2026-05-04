// ============================================================
// Archivo: src/components/clients/clients-table.tsx
// ============================================================

'use client'

import { useState, useTransition, useMemo } from 'react'
import { deleteClient } from '@/lib/actions/clients.actions'
import type { ClientWithStats } from '@/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { PrepaidDialog } from './prepaid-dialog'
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
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Trash2,
  CalendarCheck,
  CalendarDays,
  Eye,
} from 'lucide-react'
import Link from 'next/link'

interface ClientsTableProps {
  clients: ClientWithStats[]
  isAdmin: boolean
}

export function ClientsTable({ clients, isAdmin }: ClientsTableProps) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [prepaidClient, setPrepaidClient] = useState<ClientWithStats | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const q = search.toLowerCase()
    return clients.filter((c) => c.full_name.toLowerCase().includes(q))
  }, [clients, search])

  function handleDelete(client: ClientWithStats) {
    if (!confirm(`¿Eliminar a ${client.full_name} y todos sus pagos? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const result = await deleteClient(client.id)
      if (result.error) toast.error(result.error)
      else toast.success('Cliente eliminado')
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border max-w-sm"
          />
        </div>

        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Cliente</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Monto mensual</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Día de pago</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Estado</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Deuda total</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Prepagado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    {search ? 'Sin resultados' : 'No hay clientes registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => (
                  <TableRow
                    key={client.id}
                    className={cn(
                      'border-border transition-colors',
                      client.overdue_payments > 0 ? 'hover:bg-red-500/5' : 'hover:bg-secondary/30'
                    )}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm text-foreground">{client.full_name}</p>
                        {client.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">{client.notes}</p>
                        )}
                        {client.created_by_name && (
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            Creado por {client.created_by_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-amber-400">
                        {formatCurrency(client.monthly_amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Día {client.payment_day}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.overdue_payments > 0 ? (
                        <Badge variant="outline" className="text-xs gap-1.5 border-red-500/30 text-red-400 bg-red-500/10">
                          <AlertTriangle className="w-3 h-3" />
                          {client.overdue_payments} en mora
                        </Badge>
                      ) : client.pending_payments > 0 ? (
                        <Badge variant="outline" className="text-xs gap-1.5 border-amber-500/30 text-amber-400 bg-amber-500/10">
                          {client.pending_payments} pendiente{client.pending_payments > 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs gap-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                          <CheckCircle2 className="w-3 h-3" />
                          Al día
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'font-mono text-sm',
                        client.total_debt > 0 ? 'text-red-400' : 'text-muted-foreground'
                      )}>
                        {client.total_debt > 0 ? formatCurrency(client.total_debt) : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {client.prepaid_months > 0 ? (
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                          +{client.prepaid_months} mes{client.prepaid_months > 1 ? 'es' : ''}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={isPending}
                          className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem>
                            <Link href={`/dashboard/clientes/${client.id}`} className="text-sm gap-2 cursor-pointer flex items-center">
                              <Eye className="w-3.5 h-3.5" />
                              Ver pagos
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setPrepaidClient(client)}
                            className="text-sm gap-2 cursor-pointer text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            Registrar pago múltiple
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem
                                onClick={() => handleDelete(client)}
                                className="text-sm gap-2 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar cliente
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
            {filtered.length} cliente{filtered.length !== 1 ? 's' : ''}
            {search && ` para "${search}"`}
          </p>
        )}
      </div>

      {/* Dialog de pago múltiple */}
      {prepaidClient && (
        <PrepaidDialog
          client={prepaidClient}
          open={!!prepaidClient}
          onClose={() => setPrepaidClient(null)}
        />
      )}
    </>
  )
}
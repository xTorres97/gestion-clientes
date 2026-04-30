// ============================================================
// Archivo: src/components/clients/debtors-table.tsx
// ============================================================

'use client'

import { useState, useTransition, useMemo } from 'react'
import { togglePaymentStatus, deleteClient } from '@/lib/actions/clients.actions'
import type { Client } from '@/types'
import { formatCurrency, formatDate, formatRelativeDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
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
  Clock,
  MoreHorizontal,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

interface DebtorsTableProps {
  debtors: Client[]
  isAdmin: boolean
  totalDebt: number
}

export function DebtorsTable({ debtors, isAdmin, totalDebt }: DebtorsTableProps) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    if (!search.trim()) return debtors
    const q = search.toLowerCase()
    return debtors.filter((c) => c.full_name.toLowerCase().includes(q))
  }, [debtors, search])

  function handleMarkPaid(client: Client) {
    startTransition(async () => {
      const result = await togglePaymentStatus(client.id, true)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`¡${client.full_name} marcado como pagado!`)
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
      {/* Stat total */}
      {debtors.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4" />
              Deuda total pendiente
            </div>
            <span className="font-mono text-lg text-red-400">{formatCurrency(totalDebt)}</span>
          </CardContent>
        </Card>
      )}

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar moroso por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border max-w-sm"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-md border border-red-500/15 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-red-500/15 bg-red-500/5 hover:bg-red-500/5">
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Cliente</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Deuda</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Desde</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-normal">Tiempo</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  {debtors.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500/40" />
                      <p className="text-sm">¡No hay morosos! Todos al día.</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Sin resultados para esa búsqueda</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-red-500/10 hover:bg-red-500/5 transition-colors"
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
                    <span className="font-mono text-sm text-red-400">
                      {formatCurrency(client.debt_amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {formatDate(client.debt_date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs gap-1.5 border-red-500/20 text-red-300 bg-red-500/5"
                    >
                      <Clock className="w-3 h-3" />
                      {formatRelativeDate(client.debt_date)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      {/* Sin asChild: evita button anidado */}
                      <DropdownMenuTrigger
                        disabled={isPending}
                        className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          onClick={() => handleMarkPaid(client)}
                          className="text-sm gap-2 cursor-pointer text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Marcar como pagado
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
          {filtered.length} moroso{filtered.length !== 1 ? 's' : ''}
          {search && ` para "${search}"`}
        </p>
      )}
    </div>
  )
}
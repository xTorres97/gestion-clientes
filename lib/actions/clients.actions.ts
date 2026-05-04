// ============================================================
// Archivo: src/lib/actions/clients.actions.ts
// ============================================================

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  ActionResult,
  Client,
  ClientWithStats,
  Payment,
  PaymentWithStatus,
  ClientFormData,
} from '@/types'

// ─── HELPERS ──────────────────────────────────────────────

// Calcula todas las due_dates que deberían existir para un cliente hasta hoy
function getDueDatesUpToToday(client: Client): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dates: Date[] = []
  const start = new Date(client.start_date)

  // Primera due_date: el payment_day del mes de start_date
  // Si el payment_day ya pasó en ese mes, empieza el mes siguiente
  let current = new Date(start.getFullYear(), start.getMonth(), client.payment_day)
  if (current < start) {
    current = new Date(start.getFullYear(), start.getMonth() + 1, client.payment_day)
  }

  // Generar fechas mes a mes hasta hoy
  while (current <= today) {
    dates.push(new Date(current))
    current = new Date(current.getFullYear(), current.getMonth() + 1, client.payment_day)
  }

  return dates
}

// Calcula el status de un payment
function computePaymentStatus(payment: Payment): PaymentWithStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(payment.due_date)
  const gracePeriodEnd = new Date(due)
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3)

  const isOverdue = !payment.is_paid && today > gracePeriodEnd
  const daysOverdue = isOverdue
    ? Math.floor((today.getTime() - gracePeriodEnd.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    ...payment,
    paid_by_name: null,
    paid_by_email: null,
    client_name: null,
    is_overdue: isOverdue,
    days_overdue: daysOverdue,
  }
}

// ─── GENERAR PAGOS FALTANTES ──────────────────────────────
// Llama esto al cargar la app para crear los payment rows que faltan
export async function generatePendingPayments(clientId: string): Promise<void> {
  const supabase = await createClient()

  // Obtener cliente
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) return

  // Obtener payments ya existentes
  const { data: existing } = await supabase
    .from('payments')
    .select('due_date')
    .eq('client_id', clientId)

  const existingDates = new Set((existing ?? []).map((p) => p.due_date))

  // Calcular cuáles due_dates faltan
  const dueDates = getDueDatesUpToToday(client as Client)
  const missing = dueDates.filter((d) => {
    const dateStr = d.toISOString().split('T')[0]
    return !existingDates.has(dateStr)
  })

  if (missing.length === 0) return

  // Aplicar meses prepagados: si hay prepaid_months, no crear esos payments
  // sino consumirlos y decrementar prepaid_months
  let prepaidRemaining = client.prepaid_months
  const toInsert: { client_id: string; due_date: string; amount: number }[] = []
  let prepaidConsumed = 0

  for (const date of missing) {
    const dateStr = date.toISOString().split('T')[0]
    if (prepaidRemaining > 0) {
      // Este mes está cubierto por prepago → insertarlo como pagado automáticamente
      toInsert.push({
        client_id: clientId,
        due_date: dateStr,
        amount: client.monthly_amount,
      })
      prepaidRemaining--
      prepaidConsumed++
    } else {
      toInsert.push({
        client_id: clientId,
        due_date: dateStr,
        amount: client.monthly_amount,
      })
    }
  }

  if (toInsert.length > 0) {
    await supabase.from('payments').upsert(toInsert, { onConflict: 'client_id,due_date' })
  }

  // Decrementar prepaid_months en el cliente
  if (prepaidConsumed > 0) {
    await supabase
      .from('clients')
      .update({ prepaid_months: client.prepaid_months - prepaidConsumed })
      .eq('id', clientId)
  }
}

// ─── OBTENER TODOS LOS CLIENTES CON STATS ─────────────────
export async function getClients(): Promise<ActionResult<ClientWithStats[]>> {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      profiles:created_by ( full_name, email ),
      payments ( id, is_paid, due_date, amount )
    `)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result: ClientWithStats[] = (clients ?? []).map((c: any) => {
    const payments: Payment[] = c.payments ?? []
    const pendingPayments = payments.filter((p) => !p.is_paid)
    const overduePayments = pendingPayments.filter((p) => {
      const grace = new Date(p.due_date)
      grace.setDate(grace.getDate() + 3)
      return today > grace
    })
    const totalDebt = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    return {
      id: c.id,
      full_name: c.full_name,
      monthly_amount: c.monthly_amount,
      payment_day: c.payment_day,
      start_date: c.start_date,
      prepaid_months: c.prepaid_months,
      notes: c.notes,
      created_by: c.created_by,
      created_at: c.created_at,
      updated_at: c.updated_at,
      created_by_name: c.profiles?.full_name ?? null,
      created_by_email: c.profiles?.email ?? null,
      pending_payments: pendingPayments.length,
      overdue_payments: overduePayments.length,
      total_debt: totalDebt,
    }
  })

  return { data: result, error: null }
}

// ─── OBTENER PAGOS DE UN CLIENTE ──────────────────────────
export async function getClientPayments(
  clientId: string
): Promise<ActionResult<PaymentWithStatus[]>> {
  // Primero generar los que falten
  await generatePendingPayments(clientId)

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      profiles:paid_by ( full_name, email )
    `)
    .eq('client_id', clientId)
    .order('due_date', { ascending: false })

  if (error) return { data: null, error: error.message }

  const result: PaymentWithStatus[] = (data ?? []).map((p: any) => ({
    ...computePaymentStatus(p as Payment),
    paid_by_name: p.profiles?.full_name ?? null,
    paid_by_email: p.profiles?.email ?? null,
    client_name: null,
  }))

  return { data: result, error: null }
}

// ─── OBTENER TODOS LOS MOROSOS ────────────────────────────
export async function getDebtors(): Promise<ActionResult<PaymentWithStatus[]>> {
  const supabase = await createClient()

  // Generar pendientes para todos los clientes
  const { data: allClients } = await supabase.from('clients').select('id')
  await Promise.all((allClients ?? []).map((c) => generatePendingPayments(c.id)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const graceCutoff = new Date(today)
  graceCutoff.setDate(graceCutoff.getDate() - 3)
  const graceCutoffStr = graceCutoff.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      profiles:paid_by ( full_name, email ),
      clients!inner ( full_name )
    `)
    .eq('is_paid', false)
    .lte('due_date', graceCutoffStr)   // due_date <= hoy - 3 días → en mora
    .order('due_date', { ascending: true })

  if (error) return { data: null, error: error.message }

  const result: PaymentWithStatus[] = (data ?? []).map((p: any) => ({
    ...computePaymentStatus(p as Payment),
    paid_by_name: p.profiles?.full_name ?? null,
    paid_by_email: p.profiles?.email ?? null,
    client_name: p.clients?.full_name ?? null,
  }))

  return { data: result, error: null }
}

// ─── CREAR CLIENTE ────────────────────────────────────────
export async function createClient_(formData: ClientFormData): Promise<ActionResult<Client>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      full_name: formData.full_name.trim(),
      monthly_amount: formData.monthly_amount,
      payment_day: formData.payment_day,
      start_date: new Date().toISOString().split('T')[0], // hoy
      prepaid_months: 0,
      notes: formData.notes?.trim() || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  // Generar el primer pago pendiente si ya tocó
  await generatePendingPayments(data.id)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clientes')
  revalidatePath('/dashboard/morosos')
  return { data: data as Client, error: null }
}

// ─── MARCAR PAGO COMO PAGADO ──────────────────────────────
export async function markPaymentPaid(paymentId: string): Promise<ActionResult<Payment>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  const { data, error } = await supabase
    .from('payments')
    .update({
      is_paid: true,
      paid_at: new Date().toISOString(),
      paid_by: user.id,
    })
    .eq('id', paymentId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clientes')
  revalidatePath('/dashboard/morosos')
  return { data: data as Payment, error: null }
}

// ─── REGISTRAR MESES PREPAGADOS ───────────────────────────
export async function addPrepaidMonths(
  clientId: string,
  months: number
): Promise<ActionResult> {
  if (months < 1) return { data: null, error: 'Debe ser al menos 1 mes' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  // Obtener prepaid_months actual
  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('prepaid_months')
    .eq('id', clientId)
    .single()

  if (fetchError) return { data: null, error: fetchError.message }

  const { error } = await supabase
    .from('clients')
    .update({ prepaid_months: client.prepaid_months + months })
    .eq('id', clientId)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/clientes')
  return { data: null, error: null }
}

// ─── ELIMINAR CLIENTE (solo admin) ────────────────────────
export async function deleteClient(clientId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from('clients').delete().eq('id', clientId)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clientes')
  revalidatePath('/dashboard/morosos')
  return { data: null, error: null }
}

// ─── BUSCAR CLIENTES POR NOMBRE ───────────────────────────
export async function searchClients(query: string): Promise<ActionResult<ClientWithStats[]>> {
  const { data, error } = await getClients()
  if (error || !data) return { data: null, error: error }
  const q = query.toLowerCase()
  return { data: data.filter((c) => c.full_name.toLowerCase().includes(q)), error: null }
}
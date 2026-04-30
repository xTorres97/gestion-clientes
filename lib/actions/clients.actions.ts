// ============================================================
// Archivo: src/lib/actions/clients.actions.ts
// ============================================================

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Client, ClientFormData } from '@/types'

// ─── OBTENER TODOS LOS CLIENTES ───────────────────────────
export async function getClients(): Promise<ActionResult<Client[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as Client[], error: null }
}

// ─── OBTENER SOLO MOROSOS ─────────────────────────────────
export async function getDebtors(): Promise<ActionResult<Client[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_paid', false)
    .order('debt_date', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data as Client[], error: null }
}

// ─── BUSCAR CLIENTES POR NOMBRE ───────────────────────────
export async function searchClients(query: string): Promise<ActionResult<Client[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .ilike('full_name', `%${query}%`)
    .order('full_name', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data: data as Client[], error: null }
}

// ─── CREAR CLIENTE ────────────────────────────────────────
// Nota: se llama createClient_ con guión bajo para no chocar con el import de supabase
export async function createClient_(formData: ClientFormData): Promise<ActionResult<Client>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'No autenticado' }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      full_name: formData.full_name.trim(),
      debt_amount: formData.debt_amount,
      notes: formData.notes?.trim() || null,
      created_by: user.id,
      is_paid: false,
      debt_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/morosos')
  return { data: data as Client, error: null }
}

// ─── MARCAR COMO PAGADO / NO PAGADO ──────────────────────
export async function togglePaymentStatus(
  clientId: string,
  isPaid: boolean
): Promise<ActionResult<Client>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .update({
      is_paid: isPaid,
      paid_at: isPaid ? new Date().toISOString() : null,
    })
    .eq('id', clientId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/morosos')
  return { data: data as Client, error: null }
}

// ─── ACTUALIZAR CLIENTE ────────────────────────────────────
export async function updateClient(
  clientId: string,
  formData: Partial<ClientFormData>
): Promise<ActionResult<Client>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .update({
      ...(formData.full_name && { full_name: formData.full_name.trim() }),
      ...(formData.debt_amount !== undefined && { debt_amount: formData.debt_amount }),
      ...(formData.notes !== undefined && { notes: formData.notes?.trim() || null }),
    })
    .eq('id', clientId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/morosos')
  return { data: data as Client, error: null }
}

// ─── ELIMINAR CLIENTE (solo admin) ────────────────────────
export async function deleteClient(clientId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/morosos')
  return { data: null, error: null }
}
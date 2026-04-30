// ============================================================
// Archivo: src/lib/actions/auth.actions.ts
// ============================================================

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult, CreateUserFormData, Profile } from '@/types'

// ─── LOGIN ────────────────────────────────────────────────
export async function login(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { data: null, error: 'Credenciales incorrectas. Verifica tu email y contraseña.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ─── LOGOUT ───────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── OBTENER PERFIL DEL USUARIO ACTUAL ────────────────────
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as Profile | null
}

// ─── CREAR USUARIO (solo admin) ───────────────────────────
export async function createUser(formData: CreateUserFormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { data: null, error: 'No tienes permisos para crear usuarios' }
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      full_name: formData.full_name,
      role: 'operator',
    },
  })

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/usuarios')
  return { data: data.user as unknown as null, error: null }
}

// ─── ACTIVAR / DESACTIVAR USUARIO (solo admin) ────────────
export async function toggleUserAccess(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { data: null, error: 'No tienes permisos' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/usuarios')
  return { data: null, error: null }
}

// ─── OBTENER TODOS LOS USUARIOS (solo admin) ──────────────
export async function getAllUsers(): Promise<ActionResult<Profile[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as Profile[], error: null }
}
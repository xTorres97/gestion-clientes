// ============================================================
// Archivo: src/types/index.ts
// Tipos TypeScript globales del proyecto
// ============================================================

export type UserRole = 'admin' | 'operator'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  full_name: string
  debt_amount: number
  is_paid: boolean
  debt_date: string
  paid_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Formulario para crear/editar cliente
export interface ClientFormData {
  full_name: string
  debt_amount: number
  notes?: string
}

// Formulario para crear usuario (solo admin)
export interface CreateUserFormData {
  email: string
  password: string
  full_name: string
}

// Respuesta genérica de operaciones
export interface ActionResult<T = null> {
  data: T | null
  error: string | null
}
// ============================================================
// Archivo: src/types/index.ts
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

// Configuración del cliente (datos fijos)
export interface Client {
  id: string
  full_name: string
  monthly_amount: number    // monto mensual base
  payment_day: number       // día del mes que toca pagar (1-28)
  start_date: string        // desde cuándo se generan pagos
  prepaid_months: number    // meses pagados por adelantado pendientes de consumir
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Cliente con info extra calculada o unida
export interface ClientWithStats extends Client {
  created_by_name: string | null
  created_by_email: string | null
  pending_payments: number      // cuántos pagos pendientes tiene
  overdue_payments: number      // cuántos están en mora (>3 días vencidos)
  total_debt: number            // suma de pagos pendientes
}

// Un pago mensual individual
export interface Payment {
  id: string
  client_id: string
  due_date: string          // fecha límite de ese mes
  amount: number
  is_paid: boolean
  paid_at: string | null
  paid_by: string | null
  created_at: string
}

// Payment con info del usuario que cobró
export interface PaymentWithUser extends Payment {
  paid_by_name: string | null
  paid_by_email: string | null
  client_name: string | null
}

// Pago con estado calculado
export interface PaymentWithStatus extends PaymentWithUser {
  is_overdue: boolean       // true si due_date + 3 días < hoy y no pagado
  days_overdue: number      // cuántos días lleva vencido (0 si no está vencido)
}

export interface ClientFormData {
  full_name: string
  monthly_amount: number
  payment_day: number
  notes?: string
}

export interface CreateUserFormData {
  email: string
  password: string
  full_name: string
}

export interface ActionResult<T = null> {
  data: T | null
  error: string | null
}
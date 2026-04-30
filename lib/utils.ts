// ============================================================
// Archivo: src/lib/utils.ts
// REEMPLAZA el utils.ts que genera shadcn (agrega las funciones al final)
// ============================================================

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy', { locale: es })
}

export function formatRelativeDate(date: string | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}
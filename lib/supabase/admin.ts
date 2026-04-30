// ============================================================
// Archivo: src/lib/supabase/admin.ts
// Cliente con service_role para operaciones de administración
// IMPORTANTE: Solo usar en Server Actions o Route Handlers
//             NUNCA importar en componentes del cliente
// ============================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
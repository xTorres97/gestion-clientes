// ============================================================
// Archivo: src/lib/supabase/server.ts
// Cliente Supabase para uso en Server Components y Route Handlers
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En Server Components el set puede fallar, es seguro ignorarlo
          }
        },
      },
    }
  )
}

// ============================================================
// Archivo: src/lib/supabase/admin.ts  (¡crea este archivo aparte!)
// Cliente con service_role — SOLO para operaciones de admin
// NUNCA expongas esta clave al cliente
// ============================================================
// import { createClient as createSupabaseClient } from '@supabase/supabase-js'
//
// export function createAdminClient() {
//   return createSupabaseClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//     { auth: { autoRefreshToken: false, persistSession: false } }
//   )
// }
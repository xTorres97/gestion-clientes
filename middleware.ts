// ============================================================
// Archivo: src/middleware.ts  (raíz de src/)
// Protege las rutas y refresca la sesión automáticamente
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca la sesión (importante para SSR)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Si no está autenticado y quiere acceder a rutas protegidas → login
  if (!user && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si está autenticado y va al login → dashboard
  if (user && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Protege todo excepto archivos estáticos y rutas de Next.js internos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
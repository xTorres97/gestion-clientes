// ============================================================
// Archivo: src/components/layout/bottom-nav.tsx
// ============================================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, AlertTriangle, UserCog } from 'lucide-react'

interface BottomNavProps { profile: Profile }

export function BottomNav({ profile }: BottomNavProps) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const items = [
    { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
    { href: '/dashboard/morosos', label: 'Morosos', icon: AlertTriangle, danger: true },
    ...(profile.role === 'admin' ? [{ href: '/dashboard/usuarios', label: 'Usuarios', icon: UserCog }] : []),
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
      <div className="flex items-stretch">
        {items.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] transition-colors relative',
                active
                  ? item.danger ? 'text-red-400' : 'text-amber-400'
                  : item.danger ? 'text-muted-foreground' : 'text-muted-foreground'
              )}
            >
              {active && (
                <span className={cn(
                  'absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full',
                  item.danger ? 'bg-red-400' : 'bg-amber-400'
                )} />
              )}
              <item.icon className="w-5 h-5" />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
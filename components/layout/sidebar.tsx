// ============================================================
// Archivo: src/components/layout/sidebar.tsx
// Solo visible en desktop (md+)
// ============================================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth.actions'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'
import {
  Users, AlertTriangle, LayoutDashboard,
  UserCog, LogOut, CircleDollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface SidebarProps { profile: Profile }

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/morosos', label: 'Morosos', icon: AlertTriangle, danger: true },
]
const adminItems = [
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: UserCog },
]

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex-col z-40">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <CircleDollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-serif text-foreground leading-none">GestorCobros</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-3">Navegación</p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all',
              isActive(item.href, item.exact)
                ? item.danger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : item.danger ? 'text-muted-foreground hover:text-red-400 hover:bg-red-500/5' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.danger && <AlertTriangle className="w-3 h-3 ml-auto text-red-500/60" />}
            </div>
          </Link>
        ))}
        {profile.role === 'admin' && (
          <>
            <Separator className="my-4" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-3">Administración</p>
            {adminItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all',
                  isActive(item.href) ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs text-amber-400 font-medium shrink-0">
            {(profile.full_name || profile.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-foreground truncate">{profile.full_name || profile.email}</p>
            <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 h-4 mt-0.5', profile.role === 'admin' ? 'border-amber-500/30 text-amber-400' : 'border-border text-muted-foreground')}>
              {profile.role === 'admin' ? 'Admin' : 'Operador'}
            </Badge>
          </div>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs">
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  )
}
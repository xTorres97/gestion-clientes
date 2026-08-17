// ============================================================
// Archivo: src/components/layout/mobile-header.tsx
// Header mobile con hamburguesa y drawer lateral
// ============================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth.actions'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'
import {
  Menu, X, CircleDollarSign, LayoutDashboard,
  Users, AlertTriangle, UserCog, LogOut,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface MobileHeaderProps {
  profile: Profile
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/morosos', label: 'Morosos', icon: AlertTriangle, danger: true },
]

const adminItems = [
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: UserCog },
]

export function MobileHeader({ profile }: MobileHeaderProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  // Título de la página actual
  const allItems: { href: string; label: string; icon: any; exact?: boolean; danger?: boolean }[] = [
    ...navItems,
    ...adminItems,
  ]
  const currentPage = allItems.find(item =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  )

  return (
    <>
      {/* Header bar — solo mobile */}
      <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <CircleDollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm font-mono text-foreground">
            {currentPage?.label ?? 'GestorCobros'}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div className={cn(
        'md:hidden fixed top-0 left-0 h-full w-72 z-50 bg-card border-r border-border flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Drawer header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-serif text-foreground">GestorCobros</p>
              <p className="text-[10px] text-muted-foreground font-mono">v1.0</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-3">
            Navegación
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <div className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-all',
                isActive(item.href, item.exact)
                  ? item.danger
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : item.danger
                  ? 'text-muted-foreground hover:text-red-400 hover:bg-red-500/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}

          {profile.role === 'admin' && (
            <>
              <div className="border-t border-border my-3" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-3">
                Administración
              </p>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <div className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-all',
                    isActive(item.href)
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Footer con perfil */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm text-amber-400 font-medium shrink-0">
              {(profile.full_name || profile.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-foreground truncate">{profile.full_name || profile.email}</p>
              <Badge variant="outline" className={cn(
                'text-[9px] px-1.5 py-0 h-4 mt-0.5',
                profile.role === 'admin'
                  ? 'border-amber-500/30 text-amber-400'
                  : 'border-border text-muted-foreground'
              )}>
                {profile.role === 'admin' ? 'Admin' : 'Operador'}
              </Badge>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
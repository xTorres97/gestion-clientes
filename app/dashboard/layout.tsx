// ============================================================
// Archivo: src/app/dashboard/layout.tsx
// ============================================================

import { getCurrentProfile } from '@/lib/actions/auth.actions'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { MobileHeader } from '@/components/layout/mobile-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (!profile.is_active) redirect('/login')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — solo desktop */}
      <Sidebar profile={profile} />

      {/* Contenido principal */}
      <main className="flex-1 md:ml-64 min-w-0">
        {/* Header mobile con hamburguesa */}
        <MobileHeader profile={profile} />
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Bottom nav — solo mobile */}
      <BottomNav profile={profile} />
    </div>
  )
}
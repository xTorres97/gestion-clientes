// ============================================================
// Archivo: src/app/dashboard/layout.tsx
// ============================================================

import { getCurrentProfile } from '@/lib/actions/auth.actions'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'

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
      <Sidebar profile={profile} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
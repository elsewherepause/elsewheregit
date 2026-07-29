import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/ui/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="flex h-screen bg-[var(--color-admin-bg)] overflow-hidden">
      <AdminNav />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

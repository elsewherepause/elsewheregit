import { auth } from '@/lib/auth'
import ChangePasswordForm from './ChangePasswordForm'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-medium mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
        Settings
      </h1>

      <div className="bg-white border border-[var(--color-border)] rounded p-6 mb-6">
        <h2 className="text-sm font-medium mb-1">Account</h2>
        <p className="text-xs text-[var(--color-ink-muted)] mb-4">{session?.user?.email}</p>
        <ChangePasswordForm />
      </div>
    </div>
  )
}

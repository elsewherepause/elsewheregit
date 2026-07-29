'use client'

import { useActionState } from 'react'
import { changePassword } from '@/actions/settings.actions'

type State = { error?: string; success?: boolean } | undefined

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined)

  return (
    <form action={action} className="space-y-3">
      <h3 className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] mb-3">
        Change Password
      </h3>

      {state?.error && <p className="text-xs text-[var(--color-accent)]">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-600">Password updated successfully.</p>}

      {(['current', 'new', 'confirm'] as const).map((field) => (
        <div key={field} className="space-y-1">
          <label className="block text-xs text-[var(--color-ink-muted)] capitalize">
            {field === 'confirm' ? 'Confirm new password' : `${field} password`}
          </label>
          <input
            name={field}
            type="password"
            required
            className="field-input"
            autoComplete={field === 'current' ? 'current-password' : 'new-password'}
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40"
      >
        {pending ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}

'use client'

import { useActionState } from 'react'
import { login } from '@/actions/auth.actions'

type State = { error?: string } | undefined

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-[var(--color-accent)] text-center">
          {state.error}
        </p>
      )}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-[var(--color-border)] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[var(--color-ink)] transition-colors"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-[var(--color-border)] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[var(--color-ink)] transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--color-ink)] text-[var(--color-paper)] py-2.5 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40"
      >
        {pending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}

import { auth } from '@/lib/auth'
import { SESSION_EXPIRED } from '@/lib/messages'

export { SESSION_EXPIRED }

/**
 * Every admin action returns one of these instead of throwing, so the admin UI can
 * always tell the person exactly what happened. Unexpected errors are logged on the
 * server and turned into a plain message.
 */
export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

/** Throw this inside an action for a message that should be shown to the person as-is. */
export class UserError extends Error {}

export async function adminAction<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const session = await auth()
    if (!session?.user) return { ok: false, error: SESSION_EXPIRED }
    return { ok: true, data: await fn() }
  } catch (err) {
    if (err instanceof UserError) return { ok: false, error: err.message }
    console.error('[admin action failed]', err)
    return { ok: false, error: 'The server couldn’t save this. Your changes are still here — try again in a moment. If it keeps happening, check the Vercel logs.' }
  }
}

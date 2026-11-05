'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function changePassword(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.email) return { error: 'You’ve been signed out. Sign in again and retry.' }

  const current = String(formData.get('current') ?? '')
  const next = String(formData.get('new') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (next !== confirm) return { error: 'The two new passwords don’t match.' }
  if (next.length < 8) return { error: 'Use at least 8 characters for the new password.' }

  try {
    const admin = await prisma.adminUser.findUnique({ where: { email: session.user.email } })
    if (!admin) return { error: 'This account no longer exists.' }
    if (!(await bcrypt.compare(current, admin.passwordHash))) return { error: 'The current password is wrong.' }
    await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(next, 12) } })
    return { success: true }
  } catch (err) {
    console.error('[changePassword]', err)
    return { error: 'The server couldn’t update the password. Try again in a moment.' }
  }
}

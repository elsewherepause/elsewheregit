'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function changePassword(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.email) return { error: 'Not authenticated.' }

  const current = formData.get('current') as string
  const next = formData.get('new') as string
  const confirm = formData.get('confirm') as string

  if (next !== confirm) return { error: 'New passwords do not match.' }
  if (next.length < 8) return { error: 'Password must be at least 8 characters.' }

  const admin = await prisma.adminUser.findUnique({ where: { email: session.user.email } })
  if (!admin) return { error: 'User not found.' }

  const valid = await bcrypt.compare(current, admin.passwordHash)
  if (!valid) return { error: 'Current password is incorrect.' }

  const hash = await bcrypt.hash(next, 12)
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: hash } })

  return { success: true }
}

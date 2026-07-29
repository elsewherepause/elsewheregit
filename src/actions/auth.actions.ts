'use server'

import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/admin',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === 'CredentialsSignin') {
        return { error: 'Invalid email or password.' }
      }
      return { error: 'Something went wrong.' }
    }
    throw err
  }
}

export async function logout() {
  await signOut({ redirectTo: '/auth/login' })
}

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email as string },
        })

        if (!admin) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        )

        if (!valid) return null

        return { id: admin.id, email: admin.email }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export async function requireAdmin() {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
}

import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD env vars are required for seeding')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })

  console.log(`Admin user seeded: ${admin.email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

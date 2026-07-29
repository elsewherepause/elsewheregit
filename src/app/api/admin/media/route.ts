import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const search = req.nextUrl.searchParams.get('search') ?? ''
  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
  const take = 32
  const skip = (page - 1) * take

  const where = search
    ? {
        OR: [
          { altText: { contains: search, mode: 'insensitive' as const } },
          { cloudinaryId: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [assets, total] = await Promise.all([
    prisma.mediaAsset.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
    prisma.mediaAsset.count({ where }),
  ])

  return NextResponse.json({ assets, total })
}

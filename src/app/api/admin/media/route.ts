import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { VIDEO_FORMATS } from '@/lib/upload/prepare-image'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'signed-out' }, { status: 401 })

  const search = req.nextUrl.searchParams.get('search') ?? ''
  const kind = req.nextUrl.searchParams.get('kind') // 'image' | 'video' | null
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1') || 1)
  const take = 40
  const where = {
    ...(search ? { OR: [
      { altText: { contains: search, mode: 'insensitive' as const } },
      { caption: { contains: search, mode: 'insensitive' as const } },
      { cloudinaryId: { contains: search, mode: 'insensitive' as const } },
    ] } : {}),
    ...(kind === 'image' ? { format: { notIn: VIDEO_FORMATS } } : kind === 'video' ? { format: { in: VIDEO_FORMATS } } : {}),
  }
  try {
    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip: (page - 1) * take }),
      prisma.mediaAsset.count({ where }),
    ])
    return NextResponse.json({ assets, total, pageSize: take })
  } catch (err) {
    console.error('[media list]', err)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}

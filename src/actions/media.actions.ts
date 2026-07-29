'use server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SaveSchema = z.object({
  cloudinaryId: z.string().min(1),
  cloudinaryUrl: z.string().url(),
  format: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  altText: z.string().optional(),
})

export async function saveMediaAsset(input: z.infer<typeof SaveSchema>) {
  await requireAdmin()
  const data = SaveSchema.parse(input)
  const asset = await prisma.mediaAsset.create({ data })
  revalidatePath('/admin/media')
  return asset
}

export async function updateMediaAsset(id: string, altText: string, caption: string) {
  await requireAdmin()
  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: { altText, caption },
  })
  revalidatePath('/admin/media')
  return asset
}

export async function deleteMediaAsset(id: string) {
  await requireAdmin()

  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw new Error('Asset not found')

  await cloudinary.uploader.destroy(asset.cloudinaryId)
  await prisma.mediaAsset.delete({ where: { id } })

  revalidatePath('/admin/media')
}

export async function getMediaAssets(page = 1, search = '') {
  await requireAdmin()
  const take = 48
  const skip = (page - 1) * take

  const where = search
    ? {
        OR: [
          { altText: { contains: search, mode: 'insensitive' as const } },
          { caption: { contains: search, mode: 'insensitive' as const } },
          { cloudinaryId: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [assets, total] = await Promise.all([
    prisma.mediaAsset.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
    prisma.mediaAsset.count({ where }),
  ])

  return { assets, total, pages: Math.ceil(total / take) }
}

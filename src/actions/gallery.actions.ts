'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { adminAction, UserError, type Result } from '@/lib/action'
import { VIDEO_FORMATS } from '@/lib/upload/prepare-image'

const GalleryImageSchema = z.object({
  altText: z.string().max(300).optional().nullable(),
  caption: z.string().max(300).optional().nullable(),
  description: z.string().max(3000).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  mediaType: z.enum(['PHOTO', 'VIDEO']),
  published: z.boolean(),
})
export type GalleryImageInput = z.infer<typeof GalleryImageSchema>

function touch() {
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
}

/** Adds media to Open Rolls. New items go to the top, so the newest shows first. */
export async function addGalleryImages(assetIds: string[]) {
  return adminAction(async () => {
    if (!assetIds.length) return []
    const first = await prisma.galleryImage.findFirst({ orderBy: { order: 'asc' }, select: { order: true } })
    const assets = await prisma.mediaAsset.findMany({ where: { id: { in: assetIds } } })
    const byId = new Map(assets.map(a => [a.id, a]))
    let order = (first?.order ?? 0) - assetIds.length
    const created = []
    for (const id of assetIds) {
      const a = byId.get(id)
      if (!a) continue
      const row = await prisma.galleryImage.create({
        data: { imageId: id, order: order++, mediaType: VIDEO_FORMATS.includes(a.format) ? 'VIDEO' : 'PHOTO' },
      })
      created.push({ ...row, image: a })
    }
    touch()
    return created
  })
}

export async function updateGalleryImage(id: string, data: GalleryImageInput): Promise<Result> {
  return adminAction(async () => {
    const parsed = GalleryImageSchema.safeParse(data)
    if (!parsed.success) throw new UserError('Some fields couldn’t be read. Check them and try again.')
    const v = parsed.data
    await prisma.galleryImage.update({
      where: { id },
      data: {
        altText: v.altText?.trim() || null,
        caption: v.caption?.trim() || null,
        description: v.description?.trim() || null,
        category: v.category?.trim() || null,
        mediaType: v.mediaType,
        published: v.published,
      },
    })
    touch()
    return undefined
  })
}

export async function deleteGalleryImage(id: string): Promise<Result> {
  return adminAction(async () => {
    await prisma.galleryImage.deleteMany({ where: { id } })
    touch()
    return undefined
  })
}

export async function reorderGalleryImages(orderedIds: string[]): Promise<Result> {
  return adminAction(async () => {
    await prisma.$transaction(orderedIds.map((id, index) => prisma.galleryImage.update({ where: { id }, data: { order: index } })))
    touch()
    return undefined
  })
}

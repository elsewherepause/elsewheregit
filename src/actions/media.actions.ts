'use server'

import { prisma } from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { adminAction, UserError, type Result } from '@/lib/action'
import { VIDEO_FORMATS } from '@/lib/upload/prepare-image'
import type { MediaAsset } from '@prisma/client'

const SaveSchema = z.object({
  cloudinaryId: z.string().min(1),
  cloudinaryUrl: z.string().url(),
  format: z.string().min(1),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
  bytes: z.number().int().nonnegative(),
  altText: z.string().optional(),
})

export async function saveMediaAsset(input: z.infer<typeof SaveSchema>): Promise<Result<MediaAsset>> {
  return adminAction(async () => {
    const parsed = SaveSchema.safeParse(input)
    if (!parsed.success) throw new UserError('The upload finished but its details couldn’t be read. Try uploading it again.')
    const d = parsed.data
    // Cloudinary occasionally omits size for some files; fall back to a sensible 3:2 so layouts still work.
    const data = { ...d, width: d.width || 1500, height: d.height || 1000 }
    const asset = await prisma.mediaAsset.upsert({ where: { cloudinaryId: d.cloudinaryId }, update: data, create: data })
    revalidatePath('/admin/media')
    return asset
  })
}

export async function updateMediaAsset(id: string, altText: string, caption: string): Promise<Result> {
  return adminAction(async () => {
    await prisma.mediaAsset.update({ where: { id }, data: { altText, caption } })
    revalidatePath('/admin/media')
    return undefined
  })
}

/** Where a media item is used, in plain words. Empty if it isn’t used anywhere. */
async function usage(asset: MediaAsset): Promise<string[]> {
  const where: string[] = []
  const [gallery, notes, projects] = await Promise.all([
    prisma.galleryImage.count({ where: { imageId: asset.id } }),
    prisma.note.findMany({ where: { OR: [{ headerImageId: asset.id }, { footerImageId: asset.id }] }, select: { title: true } }),
    prisma.project.findMany({ select: { title: true, story: true, templateData: true, heroImageId: true } }),
  ])
  if (gallery) where.push('Open Rolls')
  for (const n of notes) where.push(`the note “${n.title}”`)
  for (const p of projects) {
    const text = JSON.stringify(p.story ?? '') + JSON.stringify(p.templateData ?? '')
    if (p.heroImageId === asset.id || text.includes(`"${asset.cloudinaryId}"`)) where.push(`the story “${p.title}”`)
  }
  return where
}

export async function deleteMediaAsset(id: string): Promise<Result> {
  return adminAction(async () => {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } })
    if (!asset) return undefined
    const used = await usage(asset)
    if (used.length) {
      const list = used.length > 3 ? `${used.slice(0, 3).join(', ')} and ${used.length - 3} more` : used.join(', ')
      throw new UserError(`This is still used in ${list}. Remove it there first, then delete it here.`)
    }
    const resource_type = VIDEO_FORMATS.includes(asset.format) ? 'video' : 'image'
    const res = await cloudinary.uploader.destroy(asset.cloudinaryId, { resource_type })
    if (res?.result !== 'ok' && res?.result !== 'not found') {
      throw new UserError('Cloudinary didn’t confirm the delete, so nothing was removed. Try again in a moment.')
    }
    await prisma.mediaAsset.delete({ where: { id } })
    revalidatePath('/admin/media')
    return undefined
  })
}

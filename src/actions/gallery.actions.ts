'use server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { GalleryMediaType } from '@prisma/client'

const ImageAdjustSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
})

const GalleryImageSchema = z.object({
  altText: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  mediaType: z.enum(['PHOTO', 'VIDEO']),
  published: z.boolean(),
  imageAdjust: ImageAdjustSchema.optional().nullable(),
})

export type GalleryImageInput = z.infer<typeof GalleryImageSchema>

export async function getGalleryImages() {
  await requireAdmin()
  return prisma.galleryImage.findMany({
    include: { image: true },
    orderBy: { order: 'asc' },
  })
}

type CreateGalleryItemInput =
  | {
      type: 'PHOTO'
      imageId: string
    }
  | {
      type: 'VIDEO'
      youtubeUrl: string
      youtubeVideoId: string
    }

export async function createGalleryImage(input: CreateGalleryItemInput) {
  await requireAdmin()

  const last = await prisma.galleryImage.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const item = await prisma.galleryImage.create({
  data:
    input.type === 'PHOTO'
      ? {
          imageId: input.imageId,
          mediaType: 'PHOTO',
          altText: null,
          order: (last?.order ?? -1) + 1,
        }
      : {
          mediaType: 'VIDEO',
          youtubeUrl: input.youtubeUrl,
          youtubeVideoId: input.youtubeVideoId,
          altText: null,
          order: (last?.order ?? -1) + 1,
        },

  include: {
    image: true,
  },
})

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  return item
}

export async function updateGalleryImage(id: string, data: GalleryImageInput) {
  await requireAdmin()
  const parsed = GalleryImageSchema.parse(data)

  await prisma.galleryImage.update({
    where: { id },
    data: {
      altText: parsed.altText?.trim() || null,
      caption: parsed.caption?.trim() || null,
      description: parsed.description?.trim() || null,
      category: parsed.category?.trim() || null,
      mediaType: parsed.mediaType as GalleryMediaType,
      published: parsed.published,
      imageAdjust: parsed.imageAdjust ?? undefined,
    },
  })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin()
  await prisma.galleryImage.delete({ where: { id } })
  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
}

export async function reorderGalleryImages(orderedIds: string[]) {
  await requireAdmin()

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.galleryImage.update({ where: { id }, data: { order: index } })
    )
  )

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
}

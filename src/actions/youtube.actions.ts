'use server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1)
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2]
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2]
      }
    }

    return null
  } catch {
    return null
  }
}

export async function createYoutubeGalleryVideo(url: string) {
  await requireAdmin()

  const videoId = extractYoutubeVideoId(url)

  if (!videoId) {
    throw new Error('Invalid YouTube URL')
  }

  const last = await prisma.galleryImage.findFirst({
    orderBy: {
      order: 'desc',
    },
    select: {
      order: true,
    },
  })

  const item = await prisma.galleryImage.create({
    data: {
      mediaType: 'VIDEO',
      youtubeUrl: url,
      youtubeVideoId: videoId,
      order: (last?.order ?? -1) + 1,
      altText: null,
      published: true,
    },
    include: {
      image: true,
    },
  })

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')

  return item
}
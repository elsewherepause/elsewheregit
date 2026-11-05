import { prisma } from '@/lib/prisma'
import type { Story, StoryPhoto } from './types'

/**
 * The layout engine is only as good as the photo sizes it’s given. Stories converted
 * from the old templates only stored each photo’s Cloudinary id, so their sizes may be
 * guesses (1500×1000). This replaces every unknown or guessed size with the real one:
 * first from the media library, otherwise straight from Cloudinary.
 */
const GUESS = (p: { w: number; h: number }) => p.w === 1500 && p.h === 1000
const MONTH = 60 * 60 * 24 * 30

/** Real pixel size of a Cloudinary image. Cached for a month, so each photo is asked about once. */
async function cloudinarySize(id: string): Promise<{ w: number; h: number } | null> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloud) return null
  try {
    // fl_getinfo returns the image's details as JSON instead of the image itself.
    const res = await fetch(`https://res.cloudinary.com/${cloud}/image/upload/fl_getinfo/${id}`, { next: { revalidate: MONTH } })
    if (!res.ok) return null
    const info = await res.json()
    const w = Number(info?.input?.width), h = Number(info?.input?.height)
    return w > 0 && h > 0 ? { w, h } : null
  } catch {
    return null
  }
}

async function inBatches<T>(items: T[], size: number, fn: (t: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn))
}

export async function withRealSizes(story: Story): Promise<Story> {
  const photos: StoryPhoto[] = []
  if (story.cover.image) photos.push(story.cover.image)
  for (const b of story.blocks) if (b.type === 'photos') photos.push(...b.photos)
  if (!photos.length) return story

  const ids = [...new Set(photos.map(p => p.id))]
  const sizes = new Map<string, { w: number; h: number }>()
  try {
    const assets = await prisma.mediaAsset.findMany({ where: { cloudinaryId: { in: ids } }, select: { cloudinaryId: true, width: true, height: true } })
    for (const a of assets) if (a.width > 0 && a.height > 0 && !GUESS({ w: a.width, h: a.height })) sizes.set(a.cloudinaryId, { w: a.width, h: a.height })
  } catch (err) {
    console.error('[sizes] media lookup failed', err)
  }

  const unknown = ids.filter(id => !sizes.has(id) && photos.some(p => p.id === id && (GUESS(p) || !(p.w > 0 && p.h > 0))))
  await inBatches(unknown, 8, async id => {
    const s = await cloudinarySize(id)
    if (s) sizes.set(id, s)
  })

  const fix = (p: StoryPhoto): StoryPhoto => {
    const s = sizes.get(p.id)
    return s && (s.w !== p.w || s.h !== p.h) ? { ...p, w: s.w, h: s.h } : p
  }
  return {
    ...story,
    cover: { ...story.cover, image: story.cover.image ? fix(story.cover.image) : story.cover.image },
    blocks: story.blocks.map(b => (b.type === 'photos' ? { ...b, photos: b.photos.map(fix) } : b)),
  }
}

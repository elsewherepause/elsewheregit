import { z } from 'zod'

/**
 * A story is a cover plus an ordered list of blocks. The writer only decides the
 * order; src/lib/story/layout.ts decides how photos are arranged on the page.
 */

export const PhotoSize = z.enum(['auto', 'large', 'small'])
export type PhotoSize = z.infer<typeof PhotoSize>

export const StoryPhoto = z.object({
  /** Cloudinary public id */
  id: z.string().min(1),
  w: z.number().positive(),
  h: z.number().positive(),
  caption: z.string().max(300).optional(),
  alt: z.string().max(300).optional(),
  size: PhotoSize.optional(),
})
export type StoryPhoto = z.infer<typeof StoryPhoto>

const blockId = z.string().min(1).max(64)

export const ChapterBlock = z.object({ id: blockId, type: z.literal('chapter'), title: z.string().max(200) })
export const TextBlock = z.object({ id: blockId, type: z.literal('text'), text: z.string().max(20000) })
export const PhotosBlock = z.object({ id: blockId, type: z.literal('photos'), photos: z.array(StoryPhoto).max(200) })
export const QuoteBlock = z.object({ id: blockId, type: z.literal('quote'), text: z.string().max(2000), by: z.string().max(200).optional() })

export const StoryBlock = z.discriminatedUnion('type', [ChapterBlock, TextBlock, PhotosBlock, QuoteBlock])
export type StoryBlock = z.infer<typeof StoryBlock>
export type ChapterBlock = z.infer<typeof ChapterBlock>
export type TextBlock = z.infer<typeof TextBlock>
export type PhotosBlock = z.infer<typeof PhotosBlock>
export type QuoteBlock = z.infer<typeof QuoteBlock>
export type BlockType = StoryBlock['type']

export const StoryCover = z.object({
  title: z.string().max(200),
  image: StoryPhoto.nullable().optional(),
  location: z.string().max(200).optional(),
  coordinates: z.string().max(100).optional(),
  camera: z.string().max(200).optional(),
})
export type StoryCover = z.infer<typeof StoryCover>

export const Story = z.object({
  v: z.literal(1),
  cover: StoryCover,
  blocks: z.array(StoryBlock).max(500),
  podcasts: z.array(z.string().max(500)).max(20).optional(),
})
export type Story = z.infer<typeof Story>

export function emptyStory(title = ''): Story {
  return { v: 1, cover: { title, image: null, location: '', coordinates: '', camera: '' }, blocks: [], podcasts: [] }
}

export function newBlockId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

/** Every Cloudinary id a story uses — used to stop media that is in use from being deleted. */
export function storyMediaIds(story: Story): string[] {
  const ids: string[] = []
  if (story.cover.image) ids.push(story.cover.image.id)
  for (const b of story.blocks) if (b.type === 'photos') for (const p of b.photos) ids.push(p.id)
  return ids
}

export function storyPhotos(story: Story): StoryPhoto[] {
  return story.blocks.flatMap(b => (b.type === 'photos' ? b.photos : []))
}

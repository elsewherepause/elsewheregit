import { z } from 'zod'
import { StoryPhoto } from '@/lib/story/types'

export const NotePhotos = z.array(StoryPhoto).max(60)
export type NotePhoto = StoryPhoto

type Asset = { cloudinaryId: string; width: number; height: number; altText: string | null } | null | undefined

/**
 * The photos shown in a note’s rotating frame, in order.
 * Notes saved with the new editor have a `photos` list. Older notes only have a
 * header and/or footer photo, so those two are used instead (header first).
 */
export function notePhotos(note: { photos?: unknown; headerImage?: Asset; footerImage?: Asset }): NotePhoto[] {
  if (note.photos != null) {
    const parsed = NotePhotos.safeParse(note.photos)
    if (parsed.success) return parsed.data
  }
  const out: NotePhoto[] = []
  for (const m of [note.headerImage, note.footerImage]) {
    if (!m || out.some(p => p.id === m.cloudinaryId)) continue
    out.push({ id: m.cloudinaryId, w: m.width || 1500, h: m.height || 1000, ...(m.altText ? { alt: m.altText } : {}) })
  }
  return out
}

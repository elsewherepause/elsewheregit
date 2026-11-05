'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, refresh } from 'next/cache'
import { adminAction, UserError, type Result } from '@/lib/action'
import { slugify } from '@/lib/utils/slugify'
import { sanitizeNoteHtml } from '@/lib/utils/sanitize'
import { NotePhotos, type NotePhoto } from '@/lib/notes/photos'
import type { Prisma } from '@prisma/client'

export type Note = {
  id: string
  title: string
  slug: string
  content: string
  readTime: string
  published: boolean
  headerImageId?: string | null
  headerImage?: { cloudinaryId: string; altText: string | null; width: number; height: number } | null
  footerImageId?: string | null
  footerImage?: { cloudinaryId: string; altText: string | null; width: number; height: number } | null
  photos?: unknown
  createdAt: Date
  updatedAt: Date
}

function touch(slugs: string[]) {
  revalidatePath('/admin/notes')
  revalidatePath('/gallery')
  revalidatePath('/notes/[slug]', 'page')
  for (const s of new Set(slugs)) revalidatePath(`/notes/${s}`)
}

export async function createNote(input: { title: string; slug?: string }): Promise<Result<{ id: string }>> {
  return adminAction(async () => {
    const title = input.title?.trim()
    if (!title) throw new UserError('Give the note a title.')
    const slug = slugify(input.slug?.trim() || title)
    if (!slug) throw new UserError('Add a web address (letters, numbers and dashes).')
    if (await prisma.note.findUnique({ where: { slug } })) throw new UserError(`Another note already uses “${slug}”. Pick a different web address.`)
    // New notes start as drafts so nothing half-written appears in Open Rolls.
    const note = await prisma.note.create({ data: { title, slug, content: '', readTime: '2 min read', published: false } })
    revalidatePath('/admin/notes')
    return { id: note.id }
  })
}

export async function updateNote(id: string, data: {
  title?: string
  slug?: string
  content?: string
  readTime?: string
  headerImageId?: string | null
  footerImageId?: string | null
  photos?: NotePhoto[]
}): Promise<Result> {
  return adminAction(async () => {
    const before = await prisma.note.findUnique({ where: { id }, select: { slug: true } })
    if (!before) throw new UserError('This note no longer exists.')
    if (data.title !== undefined && !data.title.trim()) throw new UserError('Give the note a title.')
    if (data.slug !== undefined) {
      data.slug = slugify(data.slug)
      if (!data.slug) throw new UserError('Add a web address (letters, numbers and dashes).')
      if (await prisma.note.findFirst({ where: { slug: data.slug, NOT: { id } } })) throw new UserError('Another note already uses that web address.')
    }
    if (data.content !== undefined) data.content = sanitizeNoteHtml(data.content)
    const { photos, ...rest } = data
    let photosValue: Prisma.InputJsonValue | undefined
    if (photos !== undefined) {
      const parsed = NotePhotos.safeParse(photos)
      if (!parsed.success) throw new UserError('Some photos couldn’t be saved. Remove the last one you added and try again.')
      photosValue = parsed.data as Prisma.InputJsonValue
    }
    await prisma.note.update({ where: { id }, data: { ...rest, ...(photosValue !== undefined ? { photos: photosValue } : {}) } })
    touch([before.slug, data.slug ?? before.slug])
    refresh()
    return undefined
  })
}

export async function setNotePublished(id: string, published: boolean): Promise<Result> {
  return adminAction(async () => {
    const note = await prisma.note.update({ where: { id }, data: { published } })
    touch([note.slug])
    refresh()
    return undefined
  })
}

export async function deleteNote(id: string): Promise<Result> {
  return adminAction(async () => {
    const note = await prisma.note.findUnique({ where: { id } })
    if (!note) return undefined
    await prisma.note.delete({ where: { id } })
    touch([note.slug])
    return undefined
  })
}

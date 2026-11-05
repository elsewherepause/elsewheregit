'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, refresh } from 'next/cache'
import { z } from 'zod'
import { adminAction, UserError, type Result } from '@/lib/action'
import { slugify, slugProblem } from '@/lib/utils/slugify'
import { Story, emptyStory } from '@/lib/story/types'
import { loadStory } from '@/lib/story/load'

const Category = z.enum(['CULTURE', 'ADVENTURE']).nullable()

const StoryInput = z.object({
  title: z.string().trim().min(1, 'Give the story a title.').max(200),
  slug: z.string().max(120),
  category: Category,
  story: Story,
})
export type StoryInput = z.infer<typeof StoryInput>

function firstIssue(e: z.ZodError) {
  const i = e.issues[0]
  return i?.message && !i.message.startsWith('Invalid') ? i.message : 'Some of the story’s content couldn’t be read. Reload the page and try again.'
}

async function uniqueSlug(base: string, exceptId?: string) {
  const clash = await prisma.project.findFirst({ where: { slug: base, ...(exceptId ? { NOT: { id: exceptId } } : {}) }, select: { id: true } })
  if (clash) throw new UserError(`Another story already uses the web address “${base}”. Pick a different one.`)
}

function revalidatePublic(slugs: string[]) {
  revalidatePath('/home')
  revalidatePath('/sitemap.xml')
  for (const s of new Set(slugs)) revalidatePath(`/${s}`)
  // Next/previous links on every story depend on the list of stories.
  revalidatePath('/[slug]', 'page')
}

export async function createProject(input: { title: string; slug?: string; category?: string | null }): Promise<Result<{ id: string }>> {
  return adminAction(async () => {
    const title = input.title?.trim()
    if (!title) throw new UserError('Give the story a title.')
    const slug = slugify(input.slug?.trim() || title)
    const problem = slugProblem(slug)
    if (problem) throw new UserError(problem)
    await uniqueSlug(slug)
    const category = input.category === 'CULTURE' || input.category === 'ADVENTURE' ? input.category : null
    const project = await prisma.project.create({
      data: { title, slug, category, story: emptyStory(title) },
      select: { id: true },
    })
    revalidatePath('/admin/projects')
    return { id: project.id }
  })
}

async function writeStory(id: string, raw: StoryInput) {
  const parsed = StoryInput.safeParse(raw)
  if (!parsed.success) throw new UserError(firstIssue(parsed.error))
  const input = parsed.data
  const slug = slugify(input.slug || input.title)
  const problem = slugProblem(slug)
  if (problem) throw new UserError(problem)
  await uniqueSlug(slug, id)
  const before = await prisma.project.findUnique({ where: { id }, select: { slug: true, published: true } })
  if (!before) throw new UserError('This story no longer exists. It may have been deleted in another tab.')
  await prisma.project.update({
    where: { id },
    data: { title: input.title, slug, category: input.category, story: input.story },
  })
  return { slug, oldSlug: before.slug, wasPublished: before.published }
}

/** Saves the story. If it’s already published, the live page updates straight away. */
export async function saveStory(id: string, input: StoryInput): Promise<Result<{ slug: string }>> {
  return adminAction(async () => {
    const r = await writeStory(id, input)
    if (r.wasPublished) revalidatePublic([r.slug, r.oldSlug])
    revalidatePath('/admin/projects')
    refresh()
    return { slug: r.slug }
  })
}

/** Saves first, then publishes — so nothing written is ever lost by clicking Publish. */
export async function saveAndPublish(id: string, input: StoryInput): Promise<Result<{ slug: string }>> {
  return adminAction(async () => {
    const r = await writeStory(id, input)
    if (!input.story.cover.image) throw new UserError('Add a cover photo before publishing — it’s what people see on the home page.')
    const current = await prisma.project.findUnique({ where: { id }, select: { publishedAt: true } })
    await prisma.project.update({
      where: { id },
      // publishedAt is only set the first time, so republishing never reorders the home page.
      data: { published: true, publishedAt: current?.publishedAt ?? new Date() },
    })
    revalidatePublic([r.slug, r.oldSlug])
    revalidatePath('/admin/projects')
    refresh()
    return { slug: r.slug }
  })
}

export async function setPublished(id: string, published: boolean): Promise<Result> {
  return adminAction(async () => {
    const p = await prisma.project.findUnique({
      where: { id },
      select: { title: true, slug: true, publishedAt: true, story: true, templateData: true, heroImage: { select: { cloudinaryId: true, width: true, height: true } } },
    })
    if (!p) throw new UserError('This story no longer exists.')
    if (published) {
      // Older stories are converted on the fly, so check the converted version.
      const { story } = await loadStory({ ...p, blocks: [] })
      if (!story.cover.image) throw new UserError('Open the story and add a cover photo before publishing.')
    }
    await prisma.project.update({
      where: { id },
      data: published ? { published: true, publishedAt: p.publishedAt ?? new Date() } : { published: false },
    })
    revalidatePublic([p.slug])
    revalidatePath('/admin/projects')
    refresh()
    return undefined
  })
}

export async function deleteProject(id: string): Promise<Result> {
  return adminAction(async () => {
    const p = await prisma.project.findUnique({ where: { id }, select: { slug: true } })
    if (!p) return undefined
    await prisma.project.delete({ where: { id } })
    revalidatePublic([p.slug])
    revalidatePath('/admin/projects')
    refresh()
    return undefined
  })
}

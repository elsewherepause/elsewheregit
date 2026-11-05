import { prisma } from '@/lib/prisma'

/** Stories in the order the site shows them: newest published first. */
export async function getStoryOrder() {
  return prisma.project.findMany({
    where: { published: true },
    select: { slug: true, title: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })
}

/** The story after this one (wrapping round), or null if this is the only story. */
export async function getNextStory(currentSlug: string) {
  const list = await getStoryOrder()
  if (list.length < 2) return null
  const i = list.findIndex(p => p.slug === currentSlug)
  return list[(i + 1) % list.length]
}

/** The note after this one in Open Rolls order (newest first), or null. */
export async function getNextNote(currentSlug: string) {
  const list = await prisma.note.findMany({
    where: { published: true },
    select: { slug: true, title: true },
    orderBy: { createdAt: 'desc' },
  })
  if (list.length < 2) return null
  const i = list.findIndex(n => n.slug === currentSlug)
  return list[(i + 1) % list.length]
}

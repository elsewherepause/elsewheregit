import { prisma } from '@/lib/prisma'

export async function getNextProject(currentSlug?: string) {
  const projects = await prisma.project.findMany({
    where: { published: true },
    select: { slug: true, title: true },
    orderBy: { publishedAt: 'asc' },
  })

  if (projects.length === 0) return null

  if (!currentSlug) return projects[0]

  const currentIndex = projects.findIndex(p => p.slug === currentSlug)
  const nextIndex = (currentIndex + 1) % projects.length
  return projects[nextIndex]
}

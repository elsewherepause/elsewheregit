import { prisma } from '@/lib/prisma'

export type Destination = { slug: string; type: 'project' | 'note' }

export async function getAllDestinations(): Promise<Destination[]> {
  const [projects, notes] = await Promise.all([
    prisma.project.findMany({
      where: { published: true },
      select: { slug: true },
    }),
    prisma.note.findMany({
      where: { published: true },
      select: { slug: true },
    }),
  ])

  return [
    ...projects.map(p => ({ slug: p.slug, type: 'project' as const })),
    ...notes.map(n => ({ slug: `notes/${n.slug}`, type: 'note' as const })),
    { slug: 'gallery', type: 'project' as const },
  ]
}

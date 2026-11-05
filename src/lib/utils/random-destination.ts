import { prisma } from '@/lib/prisma'

export type Destination = { slug: string; type: 'project' | 'note' | 'page' }

/** Everywhere “Take me elsewhere” can send someone. */
export async function getAllDestinations(): Promise<Destination[]> {
  try {
    const [projects, notes] = await Promise.all([
      prisma.project.findMany({ where: { published: true }, select: { slug: true } }),
      prisma.note.findMany({ where: { published: true }, select: { slug: true } }),
    ])
    return [
      ...projects.map(p => ({ slug: p.slug, type: 'project' as const })),
      ...notes.map(n => ({ slug: `notes/${n.slug}`, type: 'note' as const })),
      { slug: 'gallery', type: 'page' as const },
    ]
  } catch (err) {
    console.error('[destinations]', err)
    return [{ slug: 'gallery', type: 'page' }]
  }
}

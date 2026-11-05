import { prisma } from '@/lib/prisma'
import type { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elsewhere.ink'
  const [projects, notes] = await Promise.all([
    prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.note.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
  ])
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/home`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ...projects.map(p => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...notes.map(n => ({ url: `${base}/notes/${n.slug}`, lastModified: n.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]
}

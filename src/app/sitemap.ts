import { prisma } from '@/lib/prisma'
import type { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elsewhere.com'

  const projects = await prisma.project.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  }).catch(() => [])

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/home`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...projects.map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}

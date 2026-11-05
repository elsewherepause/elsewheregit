import { prisma } from '@/lib/prisma'
import { loadStory } from './load'
import type { HomeStory } from '@/components/public/home/HomeReveal'

/** Published stories for the home page, newest first, with their cover photo. */
export async function getHomeStories(): Promise<HomeStory[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      slug: true, title: true, category: true, story: true, templateData: true,
      heroImage: { select: { cloudinaryId: true, width: true, height: true } },
    },
  })
  return Promise.all(projects.map(async p => {
    const { story } = await loadStory({ ...p, blocks: [] })
    const c = story.cover.image
    return { slug: p.slug, title: story.cover.title || p.title, category: p.category, cover: c ? { id: c.id, w: c.w, h: c.h } : null }
  }))
}

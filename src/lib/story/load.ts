import { prisma } from '@/lib/prisma'
import { Story, emptyStory } from './types'
import { legacyMediaIds, storyFromLegacy } from './legacy'
import { withRealSizes } from './sizes'

type ProjectLike = {
  title: string
  story: unknown
  templateData: unknown
  heroImage?: { cloudinaryId: string; width: number; height: number } | null
  blocks?: { id: string; type: string; order: number; payload: unknown }[]
}

/**
 * Returns the project's story. New-style stories are validated and returned as-is;
 * older stories are converted from their Template 1–4 data on the fly.
 */
export async function loadStory(p: ProjectLike): Promise<{ story: Story; converted: boolean }> {
  if (p.story) {
    const parsed = Story.safeParse(p.story)
    if (parsed.success) return { story: await withRealSizes(parsed.data), converted: false }
    console.error('Stored story failed validation, falling back to legacy data', parsed.error.issues.slice(0, 3))
  }
  const blocks = p.blocks ?? []
  if (!p.templateData && blocks.length === 0 && !p.heroImage) return { story: emptyStory(p.title), converted: false }
  const ids = legacyMediaIds(p.templateData, blocks)
  const assets = ids.length
    ? await prisma.mediaAsset.findMany({ where: { cloudinaryId: { in: ids } }, select: { cloudinaryId: true, width: true, height: true } })
    : []
  const dims = new Map(assets.map(a => [a.cloudinaryId, { w: a.width, h: a.height }]))
  return {
    story: await withRealSizes(storyFromLegacy({ title: p.title, templateData: p.templateData, blocks, heroImage: p.heroImage ?? null, dims })),
    converted: true,
  }
}

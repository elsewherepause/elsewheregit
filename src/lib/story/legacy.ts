import type { Story, StoryBlock, StoryPhoto } from './types'

/**
 * Converts stories made with the old Template 1–4 editor (templateData) or the very
 * first block editor (ContentBlock rows) into the new Story shape. Nothing is written
 * back automatically; the editor saves the converted story the first time it is saved.
 */

type Dims = Map<string, { w: number; h: number }>
type LegacySection = Record<string, unknown>
type LegacyData = Record<string, unknown> & { sections?: LegacySection[] }
type LegacyBlock = { id: string; type: string; order: number; payload: unknown }

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const stripMd = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
const stripHtml = (html: string) =>
  html
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()

let counter = 0
const id = (prefix: string) => `${prefix}${++counter}${Date.now().toString(36).slice(-3)}`

function photo(cid: string, dims: Dims, caption?: string): StoryPhoto {
  const d = dims.get(cid)
  // Unknown dimensions: assume 3:2 landscape so the layout still works.
  return { id: cid, w: d?.w || 1500, h: d?.h || 1000, ...(caption ? { caption } : {}) }
}

/** All Cloudinary ids referenced by legacy data, so the caller can look up their sizes. */
export function legacyMediaIds(templateData: unknown, blocks: LegacyBlock[]): string[] {
  const ids = new Set<string>()
  const d = (templateData ?? {}) as LegacyData
  if (str(d.heroImage)) ids.add(str(d.heroImage))
  for (const s of d.sections ?? []) for (const k of ['image1', 'image2', 'image3', 'image4']) if (str(s[k])) ids.add(str(s[k]))
  for (const b of blocks) {
    const p = (b.payload ?? {}) as Record<string, unknown>
    const img = p.image as { cloudinaryId?: string } | undefined
    if (img?.cloudinaryId) ids.add(img.cloudinaryId)
    for (const g of (p.images as { cloudinaryId?: string }[] | undefined) ?? []) if (g.cloudinaryId) ids.add(g.cloudinaryId)
  }
  return [...ids]
}

export function storyFromLegacy(input: {
  title: string
  templateData: unknown
  blocks: LegacyBlock[]
  heroImage: { cloudinaryId: string; width: number; height: number } | null
  dims: Dims
}): Story {
  const { dims } = input
  const raw = typeof input.templateData === 'string' ? safeJson(input.templateData) : input.templateData
  const d = (raw ?? {}) as LegacyData
  const out: StoryBlock[] = []

  const heroId = str(d.heroImage) || input.heroImage?.cloudinaryId || ''
  const heroDims = input.heroImage && input.heroImage.cloudinaryId === heroId
    ? { w: input.heroImage.width, h: input.heroImage.height } : undefined
  const cover = {
    title: stripMd(str(d.titleBold)) || input.title,
    image: heroId ? { ...photo(heroId, dims), ...(heroDims ?? {}) } : null,
    location: str(d.location),
    coordinates: str(d.coordinates),
    camera: str(d.camera),
  }

  // Template 1–4 sections (also very old s01–s11 keys)
  const sections: LegacySection[] = Array.isArray(d.sections)
    ? d.sections
    : ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11']
        .map(k => d[k] as LegacySection | undefined).filter((s): s is LegacySection => !!s)

  for (const s of sections) {
    if (str(s.headline).trim()) out.push({ id: id('c'), type: 'chapter', title: stripMd(str(s.headline)).trim() })
    const photos = [1, 2, 3, 4]
      .map(n => ({ cid: str(s[`image${n}`]), cap: str(s[`caption${n}`]) }))
      .filter(x => x.cid)
      .map(x => photo(x.cid, dims, x.cap || undefined))
    if (photos.length) out.push({ id: id('p'), type: 'photos', photos })
    const paras = [1, 2, 3, 4, 5, 6].map(n => str(s[`body${n}`]).trim()).filter(Boolean)
    if (str(s.headline2).trim()) paras.unshift(str(s.headline2).trim())
    if (paras.length) out.push({ id: id('t'), type: 'text', text: paras.join('\n\n') })
    for (const q of [str(s.quote), str(s.quote2)]) if (q.trim()) out.push({ id: id('q'), type: 'quote', text: q.trim() })
  }

  // First-generation content blocks
  for (const b of [...input.blocks].sort((x, y) => x.order - y.order)) {
    const p = (b.payload ?? {}) as Record<string, unknown>
    const img = p.image as { cloudinaryId?: string } | undefined
    switch (b.type) {
      case 'INTRO':
        if (str(p.title)) out.push({ id: id('c'), type: 'chapter', title: str(p.title) })
        if (str(p.subtitle) || str(p.description)) out.push({ id: id('t'), type: 'text', text: [str(p.subtitle), str(p.description)].filter(Boolean).join('\n\n') })
        break
      case 'RICH_TEXT':
        if (str(p.heading)) out.push({ id: id('c'), type: 'chapter', title: str(p.heading) })
        if (str(p.html)) out.push({ id: id('t'), type: 'text', text: stripHtml(str(p.html)) })
        break
      case 'IMAGE_TEXT':
        if (str(p.heading)) out.push({ id: id('c'), type: 'chapter', title: str(p.heading) })
        if (img?.cloudinaryId) out.push({ id: id('p'), type: 'photos', photos: [photo(img.cloudinaryId, dims)] })
        if (str(p.content)) out.push({ id: id('t'), type: 'text', text: stripHtml(str(p.content)) })
        break
      case 'FULL_WIDTH_IMAGE':
      case 'PORTRAIT_IMAGE':
      case 'LANDSCAPE_IMAGE':
        if (img?.cloudinaryId) out.push({ id: id('p'), type: 'photos', photos: [photo(img.cloudinaryId, dims, str(p.caption) || undefined)] })
        break
      case 'GALLERY': {
        const imgs = ((p.images as { cloudinaryId?: string }[] | undefined) ?? []).filter(g => g.cloudinaryId)
        if (imgs.length) out.push({ id: id('p'), type: 'photos', photos: imgs.map(g => photo(g.cloudinaryId!, dims)) })
        break
      }
      case 'QUOTE':
        if (str(p.quote)) out.push({ id: id('q'), type: 'quote', text: str(p.quote), by: str(p.attribution) || undefined })
        break
    }
  }

  // Merge photo blocks that ended up next to each other, so the layout can group them.
  const merged: StoryBlock[] = []
  for (const b of out) {
    const prev = merged[merged.length - 1]
    if (b.type === 'photos' && prev?.type === 'photos') prev.photos.push(...b.photos)
    else merged.push(b)
  }

  const podcasts = Array.isArray(d.podcastSpotifyUrls) ? (d.podcastSpotifyUrls as unknown[]).map(str).filter(Boolean) : []
  return { v: 1, cover, blocks: merged, podcasts }
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s) } catch { return {} }
}

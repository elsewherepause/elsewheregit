import type { Story, StoryPhoto, StoryBlock } from './types'

/**
 * The story auto-layout engine.
 *
 * For each run of photos it tries every way of grouping them (one wide, a pair, a row
 * of 2 or 3, a photo beside a short paragraph, a lone photo) and keeps the sequence
 * with the best total score. Photos are never cropped: rows are rendered with
 * flex-grow = aspect ratio, so they share one height and exactly fill the width.
 * This is the same logic you approved in the round-2 demo.
 */

export type Shape = 'L' | 'P' | 'S'
export function shapeOf(p: { w: number; h: number }): Shape {
  const ar = p.w / p.h
  return ar >= 1.25 ? 'L' : ar <= 0.85 ? 'P' : 'S'
}
const ar = (p: StoryPhoto) => p.w / p.h
const upright = (p: StoryPhoto) => shapeOf(p) !== 'L'

export type Arrangement =
  | { kind: 'wide'; photos: [StoryPhoto] }
  | { kind: 'solo'; photos: [StoryPhoto]; widthPct: number }
  | { kind: 'side'; photos: [StoryPhoto]; text: string; flip: boolean }
  | { kind: 'pair'; photos: StoryPhoto[] }
  | { kind: 'row2'; photos: StoryPhoto[] }
  | { kind: 'row3'; photos: StoryPhoto[] }

type Kind = Arrangement['kind']
type Cand = { kind: Kind; take: number; photos: StoryPhoto[]; h: number; w?: number; allUpright?: boolean }

const BASE: Record<Kind, number> = { wide: 30, side: 34, pair: 30, row2: 27, row3: 26, solo: -4 }

function candidates(ph: StoryPhoto[], i: number, W: number, hasText: boolean, narrow: boolean): Cand[] {
  const out: Cand[] = []
  const a = ph[i], b = ph[i + 1], c = ph[i + 2]
  const G = narrow ? 8 : 16
  const row = (list: StoryPhoto[], kind: Kind): Cand => {
    const s = list.reduce((t, p) => t + ar(p), 0)
    return { kind, take: list.length, photos: list, h: (W - G * (list.length - 1)) / s }
  }
  const size = a.size ?? 'auto'

  // A photo marked Large always stands on its own, as big as it sensibly can be.
  if (size === 'large') {
    if (!upright(a) || narrow) return [{ kind: 'wide', take: 1, photos: [a], h: W / ar(a) }]
    const sw = Math.min(W * 0.72, W * 0.85 * ar(a))
    return [{ kind: 'solo', take: 1, photos: [a], h: sw / ar(a), w: sw }]
  }

  if (!upright(a) && size !== 'small') out.push({ kind: 'wide', take: 1, photos: [a], h: W / ar(a) })
  else {
    // A lone upright photo is kept modest: at most half the width, never taller than 0.62 × width.
    const cap = size === 'small' ? 0.36 : 0.5
    const sw = narrow ? (size === 'small' ? W * 0.7 : W) : Math.min(W * cap, W * 0.62 * ar(a))
    out.push({ kind: 'solo', take: 1, photos: [a], h: sw / ar(a), w: sw })
    if (hasText && !narrow && upright(a)) out.push({ kind: 'side', take: 1, photos: [a], h: (W * 5) / 11 / ar(a) })
  }
  const joinable = (p?: StoryPhoto) => !!p && (p.size ?? 'auto') !== 'large'
  if (joinable(b)) {
    if (upright(a) && upright(b!)) out.push(row([a, b!], 'pair'))
    else out.push(row([a, b!], 'row2'))
  }
  if (joinable(b) && joinable(c) && !narrow) {
    const r3 = row([a, b!, c!], 'row3')
    r3.allUpright = upright(a) && upright(b!) && upright(c!)
    out.push(r3)
  }
  return out
}

function score(c: Cand, last: Kind | null, W: number, narrow: boolean): number {
  let s = 0
  const ratio = c.h / W
  const lo = narrow ? 0.45 : 0.28, hi = narrow ? 1.3 : 0.64
  if (ratio < lo) s -= (lo - ratio) * 400
  if (ratio > hi) s -= (ratio - hi) * 260
  s += c.kind === 'row3' && c.allUpright ? 33 : BASE[c.kind]
  if (c.kind === last) s -= c.kind === 'solo' || c.kind === 'side' ? 70 : 30
  if (last === 'row3' && c.kind === 'row2') s -= 12
  return s
}

/**
 * Lays out one run of photos. `texts` are short paragraphs that may be placed
 * beside upright photos; any not used are returned in `leftover`.
 */
export function layoutPhotos(
  photos: StoryPhoto[],
  texts: string[],
  opts: { narrow: boolean; flipStart?: boolean },
): { arrangements: Arrangement[]; leftover: string[] } {
  const narrow = opts.narrow
  const W = narrow ? 358 : 1100
  if (photos.length === 0) return { arrangements: [], leftover: texts }
  // Exhaustive search with memo. Very long runs are split so it always stays instant.
  if (photos.length > 60) {
    const a = layoutPhotos(photos.slice(0, 60), texts, opts)
    const b = layoutPhotos(photos.slice(60), a.leftover, opts)
    return { arrangements: [...a.arrangements, ...b.arrangements], leftover: b.leftover }
  }
  type Best = { v: number; seq: Cand[] }
  const memo = new Map<string, Best>()
  const best = (i: number, last: Kind | null, t: number): Best => {
    if (i >= photos.length) return { v: 0, seq: [] }
    const key = `${i}|${last}|${t}`
    const hit = memo.get(key)
    if (hit) return hit
    let top: Best = { v: -1e9, seq: [] }
    for (const c of candidates(photos, i, W, t < texts.length, narrow)) {
      const nt = c.kind === 'side' ? t + 1 : t
      const rest = best(i + c.take, c.kind, nt)
      const v = score(c, last, W, narrow) + rest.v
      if (v > top.v) top = { v, seq: [c, ...rest.seq] }
    }
    memo.set(key, top)
    return top
  }
  let t = 0
  let flip = !!opts.flipStart
  const arrangements: Arrangement[] = best(0, null, 0).seq.map((c): Arrangement => {
    switch (c.kind) {
      case 'wide': return { kind: 'wide', photos: [c.photos[0]] }
      case 'solo': return { kind: 'solo', photos: [c.photos[0]], widthPct: Math.round(((c.w ?? W) / W) * 1000) / 10 }
      case 'side': { const a: Arrangement = { kind: 'side', photos: [c.photos[0]], text: texts[t++], flip }; flip = !flip; return a }
      default: return { kind: c.kind, photos: c.photos }
    }
  })
  return { arrangements, leftover: texts.slice(t) }
}

/** A paragraph short enough to sit beside a photo. */
const SIDE_MAX = 650
export function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
}

export type Section =
  | { kind: 'chapter'; id: string; title: string; n: number }
  | { kind: 'text'; id: string; paragraphs: string[] }
  | { kind: 'quote'; id: string; text: string; by?: string }
  | { kind: 'photos'; id: string; arrangements: Arrangement[] }

/**
 * Turns the writer's block list into render-ready sections. A text block that comes
 * straight after a photos block can lend its short paragraphs to sit beside portraits.
 */
export function buildSections(story: Story, narrow: boolean): Section[] {
  const out: Section[] = []
  const blocks: StoryBlock[] = story.blocks
  let chapterN = 0
  let flip = false
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.type === 'chapter') {
      if (b.title.trim()) out.push({ kind: 'chapter', id: b.id, title: b.title.trim(), n: ++chapterN })
    } else if (b.type === 'text') {
      const paragraphs = splitParagraphs(b.text)
      if (paragraphs.length) out.push({ kind: 'text', id: b.id, paragraphs })
    } else if (b.type === 'quote') {
      if (b.text.trim()) out.push({ kind: 'quote', id: b.id, text: b.text.trim(), by: b.by?.trim() || undefined })
    } else if (b.type === 'photos') {
      const photos = b.photos.filter(p => p.id && p.w > 0 && p.h > 0)
      if (!photos.length) continue
      const next = blocks[i + 1]
      let lend: string[] = []
      let rest: string[] = []
      if (next && next.type === 'text') {
        const paras = splitParagraphs(next.text)
        // Only lend from the start of the next text, and only short paragraphs.
        let k = 0
        while (k < paras.length && paras[k].length <= SIDE_MAX) k++
        lend = paras.slice(0, k)
        rest = paras.slice(k)
      }
      const { arrangements, leftover } = layoutPhotos(photos, lend, { narrow, flipStart: flip })
      flip = arrangements.filter(a => a.kind === 'side').length % 2 === 1 ? !flip : flip
      out.push({ kind: 'photos', id: b.id, arrangements })
      if (next && next.type === 'text') {
        const remaining = [...leftover, ...rest]
        if (remaining.length) out.push({ kind: 'text', id: next.id, paragraphs: remaining })
        i++ // the text block has been handled
      }
    }
  }
  return out
}

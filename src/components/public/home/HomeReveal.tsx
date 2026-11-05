'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import TakeMeElsewhere from '@/components/public/TakeMeElsewhere'
import { photoUrl } from '@/lib/utils/cloudinary-url'

export type HomeStory = {
  slug: string
  title: string
  category: 'CULTURE' | 'ADVENTURE' | null
  cover: { id: string; w: number; h: number } | null
}

const LABEL = { CULTURE: 'Culture', ADVENTURE: 'Adventure' } as const
type Box = { x: number; y: number; w: number; h: number }

/**
 * Zigzag layout: same-height photos alternating high and low, each tucked under the
 * last, never overlapping. Height comes from the window height, so a wider screen
 * simply shows more stories.
 */
function layout(stories: HomeStory[], vh: number): { boxes: Box[]; width: number } {
  const T = 128, B = vh - 82 - 24 // leave room for captions and “Take me elsewhere”
  const h = Math.max(140, Math.round((B - T) * 0.43))
  const boxes: Box[] = []
  stories.forEach((s, i) => {
    const ar = s.cover ? s.cover.w / s.cover.h : 1.5
    const w = Math.round(h * Math.min(Math.max(ar, 0.6), 2.4))
    const y = i % 2 ? B - h : T
    let x = 40
    if (i > 0) {
      const prev = boxes[i - 1]
      x = prev.x + Math.round(prev.w * 0.55)
      const prev2 = boxes[i - 2]
      if (prev2) x = Math.max(x, prev2.x + prev2.w + 40)
      if (y < prev.y + prev.h + 24 && y + h > prev.y) x = Math.max(x, prev.x + prev.w + 40)
    }
    boxes.push({ x, y, w, h })
  })
  const last = boxes[boxes.length - 1]
  return { boxes, width: last ? last.x + last.w + 160 : 0 }
}

export default function HomeReveal({ stories, destinations }: { stories: HomeStory[]; destinations: { slug: string }[] }) {
  const [filter, setFilter] = useState<'CULTURE' | 'ADVENTURE' | null>(null)
  const [vh, setVh] = useState(900)
  const scroller = useRef<HTMLDivElement>(null)
  const list = useMemo(() => stories.filter(s => s.cover && (!filter || s.category === filter)), [stories, filter])
  const { boxes, width } = useMemo(() => layout(list, vh), [list, vh])
  const cats = (['CULTURE', 'ADVENTURE'] as const).filter(c => stories.some(s => s.category === c))

  useEffect(() => {
    const update = () => setVh(window.innerHeight)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Vertical wheel scrolls the strip sideways.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); el.scrollLeft += e.deltaY }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Reveal each photo as it comes into view, and drift the picture inside its frame.
  useEffect(() => {
    const root = scroller.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.hm-card'))
    let n = 0
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        const delay = reduce ? 0 : (n++ % 6) * 110
        window.setTimeout(() => el.classList.add('in'), delay)
        io.unobserve(el)
      }
    }, { threshold: 0.15 })
    cards.forEach(c => { c.classList.remove('in'); io.observe(c) })
    let raf = 0
    const drift = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!root || reduce) return
        const mid = root.scrollLeft + window.innerWidth / 2
        root.querySelectorAll<HTMLElement>('.hm-card').forEach(c => {
          const img = c.querySelector('img')
          if (!img) return
          const rel = (c.offsetLeft + c.offsetWidth / 2 - mid) / window.innerWidth
          img.style.transform = `translate3d(${(Math.max(-1, Math.min(1, rel)) * -9).toFixed(2)}%,0,0)`
        })
      })
    }
    drift()
    root?.addEventListener('scroll', drift, { passive: true })
    return () => { io.disconnect(); root?.removeEventListener('scroll', drift); cancelAnimationFrame(raf) }
  }, [boxes])

  if (stories.length === 0) return <p className="hm-empty">Stories are on their way</p>

  const filterBar = cats.length > 1 && (
    <div className="hm-filter" role="group" aria-label="Filter stories">
      <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>All</button>
      {cats.map(c => <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)}>{LABEL[c]}</button>)}
    </div>
  )

  const card = (s: HomeStory, i: number, style?: React.CSSProperties) => (
    <Link key={s.slug} href={`/${s.slug}`} className="hm-card" style={style}>
      <span className="hm-frame" style={style ? undefined : { aspectRatio: `${s.cover!.w} / ${s.cover!.h}`, display: 'block' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl(s.cover!.id, 1000)} alt={s.title} loading={i < 4 ? 'eager' : 'lazy'} draggable={false} />
      </span>
      {i === 0 && !filter && <span className="hm-new">New</span>}
      <span className="hm-cap">{s.title}{s.category && <span>{LABEL[s.category]}</span>}</span>
    </Link>
  )

  return (
    <>
      {filterBar}
      <div className="hm" ref={scroller}>
        <div className="hm-canvas" style={{ width: Math.max(width, 1) }}>
          {list.map((s, i) => card(s, i, { left: boxes[i].x, top: boxes[i].y, width: boxes[i].w, height: boxes[i].h }))}
        </div>
      </div>
      <div className="hm-cta hm-cta-d"><TakeMeElsewhere destinations={destinations} /></div>
      <div className="hm-mobile">
        <div className="hm-list">{list.map((s, i) => card(s, i))}</div>
        <div className="hm-cta"><TakeMeElsewhere destinations={destinations} /></div>
      </div>
    </>
  )
}

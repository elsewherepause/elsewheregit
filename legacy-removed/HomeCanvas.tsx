'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import TakeMeElsewhere from '@/components/public/TakeMeElsewhere'
import CroppedImage from '@/components/shared/CroppedImage'
import { SLOT_PATTERN } from '@/lib/homepage-slots'

const CANVAS_H = 900
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const PATTERN_WIDTH = 3100

function buildSlots(count: number) {
  const slots = []
  for (let i = 0; i < count; i++) {
    const cycle = Math.floor(i / SLOT_PATTERN.length)
    const pattern = SLOT_PATTERN[i % SLOT_PATTERN.length]
    slots.push({ ...pattern, l: pattern.l + cycle * PATTERN_WIDTH })
  }
  return slots
}

function computeCanvasWidth(slots: { l: number; w: number }[]) {
  if (slots.length === 0) return 1200
  const last = slots.reduce((a, b) => (a.l + a.w > b.l + b.w ? a : b))
  return last.l + last.w + 250
}

const CATEGORIES = ['CULTURE', 'ADVENTURE'] as const
type Category = typeof CATEGORIES[number]

export type HomeProject = {
  slug: string
  title: string
  heroImageId: string | null
  homepageHeroAdjust?: { x: number; y: number; zoom: number } | null
  category?: Category | null
}

export default function HomeCanvas({ projects, destinations = [] }: { projects: HomeProject[]; destinations?: { slug: string }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<Category | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    const update = () => setScale(window.innerHeight / CANVAS_H)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    const el = scrollRef.current
    if (!el) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  function toggleFilter(cat: Category) {
    setActiveFilter(prev => (prev === cat ? null : cat))
  }

  const filtered = useMemo(() => {
    if (!activeFilter) return projects
    return projects.filter(p => p.category === activeFilter)
  }, [projects, activeFilter])

  const slots = useMemo(() => buildSlots(filtered.length), [filtered.length])
  const canvasW = useMemo(() => computeCanvasWidth(slots), [slots])

  const font = 'Montserrat, sans-serif'

  return (
    <div
      ref={scrollRef}
      className="w-screen h-screen overflow-x-auto overflow-y-hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div style={{
        width: canvasW * scale,
        height: CANVAS_H * scale,
        marginLeft: 36 - (80 * scale),
        marginTop: -20 * scale,
      }}>
        <div style={{
          width: canvasW,
          height: CANVAS_H,
          position: 'relative',
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          background: '#fff',
        }}>

          {/* ── Photo slots ── */}
          {slots.map((slot, i) => {
            const project = filtered[i]
            if (!project) return null

            const imgId = project.heroImageId
            const adj = project.homepageHeroAdjust
            const maxDim = Math.max(slot.w, slot.h) * 2
            const url = imgId && CLOUD
              ? `https://res.cloudinary.com/${CLOUD}/image/upload/w_${maxDim},q_auto,f_auto/${imgId}`
              : null

            const hovered = hoveredIdx === i

            return (
              <Link
                key={i}
                href={`/${project.slug}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  position: 'absolute', left: slot.l, top: slot.t,
                  width: slot.w, height: slot.h,
                  background: 'transparent',
                  display: 'block', textDecoration: 'none',
                }}
              >
                <p style={{
                  position: 'absolute', left: 0, bottom: '100%', width: '100%',
                  margin: 0, marginBottom: 0, padding: 0,
                  fontFamily: font, fontSize: 14, fontWeight: 700, lineHeight: 1.2,
                  textTransform: 'uppercase', color: '#1c1c1c',
                  whiteSpace: 'normal', overflowWrap: 'break-word',
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  pointerEvents: 'none',
                }}>
                  {project.title}
                </p>
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  {url ? (
                    <CroppedImage src={url} alt={project.title} adj={adj ?? undefined} aspect={slot.w / slot.h} />
                  ) : (
                    <div style={{ width: '100%', height: '100%' }} />
                  )}
                </div>
              </Link>
            )
          })}

        </div>
      </div>

      {/* ── Filter bar (fixed) ── */}
      <div className="left-6 md:left-[36px]" style={{ position: 'fixed', top: 80 * scale, display: 'flex', alignItems: 'center', gap: 24, zIndex: 10 }}>
        <p
          onClick={() => setFilterOpen(v => !v)}
          style={{
            fontFamily: font, fontSize: 14, textTransform: 'uppercase', margin: 0,
            cursor: 'pointer',
            fontWeight: filterOpen ? 700 : 400,
            color: filterOpen ? '#1c1c1c' : '#ccc',
            transition: 'color 0.2s, font-weight 0.2s',
          }}
        >
          filter
        </p>

        {filterOpen && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {CATEGORIES.map(cat => {
              const isActive = activeFilter === cat
              return (
                <p
                  key={cat}
                  onClick={() => toggleFilter(cat)}
                  style={{
                    fontFamily: font, fontSize: 14, textTransform: 'uppercase', margin: 0,
                    cursor: 'pointer',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#1c1c1c' : '#ccc',
                    transition: 'color 0.2s, font-weight 0.2s',
                  }}
                >
                  {cat}
                </p>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Take me elsewhere CTA (fixed center) ── */}
      <TakeMeElsewhere
        destinations={destinations}
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 40,
          transform: 'translateX(-50%)',
          fontFamily: font,
          fontSize: 16,
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#ccc',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      />
    </div>
  )
}

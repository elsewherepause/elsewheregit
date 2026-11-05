'use client'

import { useRef, useState } from 'react'
import { photoSrcSet, photoUrl } from '@/lib/utils/cloudinary-url'
import type { NotePhoto } from '@/lib/notes/photos'

/**
 * A rotating photo frame shown after a note’s text.
 * Three or more photos stand in a 3D ring with the current one facing you; the others are faint.
 * One or two photos fade between each other instead. It only turns when the visitor turns it:
 * the arrows, swiping or dragging, or the arrow keys. Sizes come from CSS (see .rf-* in
 * globals.css), so it renders correctly on first paint with no measuring.
 */
export default function PhotoFrame({ photos }: { photos: NotePhoto[] }) {
  const n = photos.length
  const ring = n > 2
  const step = 360 / Math.max(n, 1)
  // Ring radius as a multiple of the frame width, so neighbouring photos never collide.
  const k = ring ? 0.5 / Math.tan(Math.PI / n) + 0.08 : 0
  const [turns, setTurns] = useState(0)
  const [dragDeg, setDragDeg] = useState<number | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<number | null>(null)

  if (n === 0) return null
  const idx = ((turns % n) + n) % n
  const angle = turns * step + (dragDeg ?? 0)
  const go = (d: number) => { if (n > 1) setTurns(t => t + d) }
  // Width of one frame in pixels (measured from the element, since CSS sets it).
  const frameWidth = () => (stageRef.current?.querySelector<HTMLElement>('.rf-item')?.offsetWidth || 400)

  return (
    <section className={`rf${ring ? '' : ' flat'}`} aria-roledescription="carousel" aria-label="Photos from this note">
      <div
        ref={stageRef}
        className={`rf-stage${dragDeg !== null ? ' drag' : ''}`}
        tabIndex={0}
        aria-label={n > 1 ? 'Photos. Use the left and right arrow keys to turn.' : 'Photo'}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
        }}
        onPointerDown={e => {
          if (n < 2 || (e.target as HTMLElement).closest('.rf-arrow')) return
          dragStart.current = e.clientX
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragDeg(0)
        }}
        onPointerMove={e => {
          if (dragStart.current === null || !ring) return
          setDragDeg(-(e.clientX - dragStart.current) * (step / frameWidth()))
        }}
        onPointerUp={e => {
          if (dragStart.current === null) return
          const dx = e.clientX - dragStart.current, w = frameWidth()
          dragStart.current = null
          setDragDeg(null)
          if (Math.abs(dx) > w * 0.12) go((dx < 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(dx) / w)))
        }}
        onPointerCancel={() => { dragStart.current = null; setDragDeg(null) }}
      >
        <div className="rf-ring" style={ring ? { transform: `translateZ(calc(var(--boxW) * ${-k})) rotateY(${-angle}deg)` } : undefined}>
          {photos.map((p, i) => {
            const ar = p.w / p.h
            let opacity: number
            if (!ring) opacity = i === idx ? 1 : 0
            else if (i === idx && dragDeg === null) opacity = 1
            else {
              const rel = ((((i * step - angle) % 360) + 540) % 360) - 180
              const front = Math.max(0, Math.cos((rel * Math.PI) / 180))
              opacity = Math.abs(rel) < step / 2 && dragDeg !== null ? 0.18 + 0.82 * front ** 6 : 0.04 + 0.14 * front ** 2
            }
            return (
              <div
                key={`${p.id}-${i}`}
                className="rf-item"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}`}
                aria-hidden={i !== idx}
                style={{ opacity, transform: ring ? `rotateY(${i * step}deg) translateZ(calc(var(--boxW) * ${k}))` : undefined }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(p.id, 1200)}
                  srcSet={photoSrcSet(p.id)}
                  sizes="(max-width: 767px) 78vw, 42vw"
                  width={p.w}
                  height={p.h}
                  alt={p.alt || p.caption || ''}
                  draggable={false}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  style={{ width: `min(var(--boxW), calc(var(--boxH) * ${ar.toFixed(4)}))`, aspectRatio: `${p.w} / ${p.h}` }}
                />
              </div>
            )
          })}
        </div>
        {n > 1 && (
          <>
            <button type="button" className="rf-arrow l" aria-label="Previous photo" onClick={() => go(-1)}>
              <svg viewBox="0 0 24 48" aria-hidden="true"><path d="M18 4 6 24l12 20" /></svg>
            </button>
            <button type="button" className="rf-arrow r" aria-label="Next photo" onClick={() => go(1)}>
              <svg viewBox="0 0 24 48" aria-hidden="true"><path d="M6 4l12 20L6 44" /></svg>
            </button>
          </>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{`Photo ${idx + 1} of ${n}${photos[idx].caption ? `: ${photos[idx].caption}` : ''}`}</p>
    </section>
  )
}

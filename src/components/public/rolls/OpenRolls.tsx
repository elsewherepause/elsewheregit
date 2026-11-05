'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { cloudinaryVideoThumbnail, photoUrl } from '@/lib/utils/cloudinary-url'
import { toRows } from './rows'
import Lightbox from './Lightbox'

export type RollItem = {
  key: string
  id: string
  w: number
  h: number
  type: 'PHOTO' | 'VIDEO'
  caption: string | null
  description: string | null
  alt: string | null
  category: string | null
}
export type RollNote = { slug: string; title: string; readTime: string }
type View = 'photos' | 'notes' | 'videos'

export default function OpenRolls({ items, notes }: { items: RollItem[]; notes: RollNote[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const v = params.get('view')
  const view: View = v === 'notes' || v === 'videos' ? v : 'photos'
  const [cat, setCat] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)

  const setView = (next: View) => {
    setCat(null)
    router.replace(next === 'photos' ? '/gallery' : `/gallery?view=${next}`, { scroll: false })
  }
  const ofType = useMemo(() => items.filter(i => (view === 'videos' ? i.type === 'VIDEO' : i.type === 'PHOTO')), [items, view])
  const cats = useMemo(() => Array.from(new Set(ofType.map(i => i.category).filter((c): c is string => !!c))), [ofType])
  const shown = useMemo(() => ofType.filter(i => !cat || i.category === cat), [ofType, cat])
  const step = useCallback((d: number) => setOpen(o => (o === null ? o : (o + d + shown.length) % shown.length)), [shown.length])
  const close = useCallback(() => setOpen(null), [])

  const grid = (target: number, cls: string) => (
    <div className={cls}>
      {toRows(shown, i => i.w / i.h, target).map((row, r) => (
        <div key={r} className="or-row">
          {row.items.map(it => {
            const idx = shown.indexOf(it)
            const src = it.type === 'VIDEO' ? cloudinaryVideoThumbnail(it.id, { width: 900, crop: 'limit' }) : photoUrl(it.id, 900)
            return (
              <button key={it.key} type="button" className={`or-tile${it.type === 'VIDEO' ? ' vid' : ''}`} style={{ flexGrow: it.w / it.h }} onClick={() => setOpen(idx)} aria-label={it.caption || (it.type === 'VIDEO' ? 'Play video' : 'Open photo')}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} width={it.w} height={it.h} alt={it.alt || it.caption || ''} loading={r < 2 ? 'eager' : 'lazy'} decoding="async" />
                {it.caption && <span className="cap">{it.caption}</span>}
              </button>
            )
          })}
          {row.spacer > 0 && <span aria-hidden="true" style={{ flexGrow: row.spacer, flexBasis: 0 }} />}
        </div>
      ))}
    </div>
  )

  return (
    <div className="or">
      <div className="or-bar">
        <div className="or-tabs" role="group" aria-label="Show">
          {(['photos', 'notes', 'videos'] as const).map(t => (
            <button key={t} type="button" aria-pressed={view === t} onClick={() => setView(t)}>{t}</button>
          ))}
        </div>
        {view !== 'notes' && cats.length > 0 && (
          <div className="or-cats" role="group" aria-label="Filter by place or theme">
            {cats.map(c => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)}>{c}</button>)}
          </div>
        )}
      </div>

      {view === 'notes' ? (
        notes.length ? (
          <ul className="or-notes">
            {notes.map(n => (
              <li key={n.slug}>
                <Link href={`/notes/${n.slug}`}>
                  <span className="k">Notes <span>| {n.readTime}</span></span>
                  <span className="t">{n.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="or-empty">No notes yet</p>
      ) : shown.length ? (
        <>
          {grid(4.6, 'st-only-d')}
          {grid(2.2, 'st-only-m')}
        </>
      ) : <p className="or-empty">{view === 'videos' ? 'No videos yet' : 'No photos yet'}</p>}

      {open !== null && shown[open] && <Lightbox item={shown[open]} onClose={close} onStep={step} />}
    </div>
  )
}

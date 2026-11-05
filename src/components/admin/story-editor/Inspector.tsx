'use client'

import { useState } from 'react'
import type { MediaAsset } from '@prisma/client'
import MediaPicker from '@/components/admin/media/MediaPicker'
import MediaUploader from '@/components/admin/media/MediaUploader'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import { shapeOf } from '@/lib/story/layout'
import type { PhotoSize, Story, StoryBlock, StoryCover, StoryPhoto } from '@/lib/story/types'

const label = 'block text-[11px] font-semibold text-[#505050] mb-1'
const hint = 'block text-[11px] text-[#767676] mt-1'
const SHAPE = { L: 'Landscape', P: 'Portrait', S: 'Square' } as const

export const toPhoto = (a: MediaAsset): StoryPhoto => ({ id: a.cloudinaryId, w: a.width || 1500, h: a.height || 1000, ...(a.altText ? { alt: a.altText } : {}) })

function Thumb({ p, h = 56 }: { p: StoryPhoto; h?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={cloudinaryUrl(p.id, { height: h * 2, crop: 'limit' })} alt="" style={{ height: h, width: 'auto', aspectRatio: `${p.w} / ${p.h}` }} className="bg-[#f0f0ee] block" />
  )
}

export function CoverInspector({ story, onChange }: { story: Story; onChange: (c: StoryCover, podcasts?: string[]) => void }) {
  const c = story.cover
  const [picker, setPicker] = useState(false)
  const set = (patch: Partial<StoryCover>) => onChange({ ...c, ...patch })
  const pods = story.podcasts ?? []
  return (
    <div className="space-y-4">
      <div>
        <label className={label} htmlFor="cv-title">Title shown on the page</label>
        <input id="cv-title" className="field-input" value={c.title} onChange={e => set({ title: e.target.value })} placeholder="Malnad Days" />
        <span className={hint}>Wrap words in **double stars** for bold.</span>
      </div>
      <div>
        <span className={label}>Cover photo</span>
        {c.image ? (
          <div className="flex items-end gap-3">
            <Thumb p={c.image} h={72} />
            <div className="flex flex-col gap-1 text-xs">
              <button type="button" className="underline text-left" onClick={() => setPicker(true)}>Change</button>
              <button type="button" className="underline text-left text-[#a33a1a]" onClick={() => set({ image: null })}>Remove</button>
            </div>
          </div>
        ) : (
          <MediaUploader zone accept="image" onUploaded={list => set({ image: toPhoto(list[0]) })} />
        )}
        {!c.image && <button type="button" className="mt-2 text-xs underline" onClick={() => setPicker(true)}>Or choose from the media library</button>}
        <span className={hint}>Shown at the top of the story and on the home page. Any shape works.</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div><label className={label} htmlFor="cv-loc">Location</label><input id="cv-loc" className="field-input" value={c.location ?? ''} onChange={e => set({ location: e.target.value })} placeholder="Malnad, Karnataka" /></div>
        <div><label className={label} htmlFor="cv-gps">Coordinates</label><input id="cv-gps" className="field-input" value={c.coordinates ?? ''} onChange={e => set({ coordinates: e.target.value })} placeholder="13.93° N, 75.57° E" /></div>
        <div><label className={label} htmlFor="cv-cam">Camera</label><input id="cv-cam" className="field-input" value={c.camera ?? ''} onChange={e => set({ camera: e.target.value })} placeholder="Leica M6, Portra 400" /></div>
      </div>
      <div>
        <span className={label}>Podcast episodes (Spotify links)</span>
        {pods.map((u, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="field-input" value={u} aria-label={`Podcast link ${i + 1}`} onChange={e => { const n = [...pods]; n[i] = e.target.value; onChange(c, n) }} placeholder="https://open.spotify.com/episode/…" />
            <button type="button" className="px-2 text-[#767676] hover:text-[#a33a1a]" aria-label="Remove link" onClick={() => onChange(c, pods.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <button type="button" className="text-xs underline" onClick={() => onChange(c, [...pods, ''])}>+ Add a Spotify link</button>
      </div>
      {picker && <MediaPicker onClose={() => setPicker(false)} onSelect={l => set({ image: toPhoto(l[0]) })} title="Choose the cover photo" />}
    </div>
  )
}

export function BlockInspector({ block, onChange }: { block: StoryBlock; onChange: (b: StoryBlock) => void }) {
  switch (block.type) {
    case 'chapter':
      return (
        <div>
          <label className={label} htmlFor="ch-t">Chapter title</label>
          <input id="ch-t" className="field-input" value={block.title} onChange={e => onChange({ ...block, title: e.target.value })} placeholder="The rain arrives before the clouds do" autoFocus />
          <span className={hint}>Chapters are numbered automatically and listed at the side of the story.</span>
        </div>
      )
    case 'text':
      return (
        <div>
          <label className={label} htmlFor="tx-t">Text</label>
          <textarea id="tx-t" className="field-input leading-relaxed" rows={12} value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} placeholder="Write here…" autoFocus />
          <span className={hint}>Leave an empty line between paragraphs. **bold**, *italic*. Short paragraphs right after a Photos block may be placed beside a portrait.</span>
        </div>
      )
    case 'quote':
      return (
        <div className="space-y-3">
          <div><label className={label} htmlFor="qt-t">Quote</label><textarea id="qt-t" className="field-input" rows={4} value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} autoFocus /></div>
          <div><label className={label} htmlFor="qt-b">Who said it (optional)</label><input id="qt-b" className="field-input" value={block.by ?? ''} onChange={e => onChange({ ...block, by: e.target.value })} /></div>
        </div>
      )
    case 'photos':
      return <PhotosInspector block={block} onChange={onChange} />
  }
}

function PhotosInspector({ block, onChange }: { block: Extract<StoryBlock, { type: 'photos' }>; onChange: (b: StoryBlock) => void }) {
  const [picker, setPicker] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const photos = block.photos
  const set = (list: StoryPhoto[]) => onChange({ ...block, photos: list })
  const add = (list: StoryPhoto[]) => set([...photos, ...list])
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= photos.length) return
    const n = [...photos]; [n[i], n[j]] = [n[j], n[i]]; set(n); setOpen(j)
  }
  const patch = (i: number, p: Partial<StoryPhoto>) => set(photos.map((x, k) => (k === i ? { ...x, ...p } : x)))
  return (
    <div className="space-y-3">
      <MediaUploader zone accept="image" onUploaded={list => add(list.map(toPhoto))} />
      <button type="button" className="text-xs underline" onClick={() => setPicker(true)}>Choose from the media library</button>
      <p className={hint}>Add as many as you like, in the order you want them. The layout is chosen for you.</p>
      <ul className="space-y-1.5">
        {photos.map((p, i) => (
          <li key={`${p.id}-${i}`} className={`border ${open === i ? 'border-black' : 'border-[#e8e8e8]'} bg-white`}>
            <div className="flex items-center gap-2 p-1.5">
              <button type="button" className="flex items-center gap-2 flex-1 min-w-0 text-left" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <Thumb p={p} h={40} />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold truncate">{p.caption || `Photo ${i + 1}`}</span>
                  <span className="block text-[10px] text-[#767676]">{SHAPE[shapeOf(p)]}{p.size && p.size !== 'auto' ? ` · ${p.size === 'large' ? 'Large' : 'Small'}` : ''}</span>
                </span>
              </button>
              <span className="flex">
                <button type="button" className="w-7 h-7 text-[#767676] hover:text-black disabled:opacity-20" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button type="button" className="w-7 h-7 text-[#767676] hover:text-black disabled:opacity-20" disabled={i === photos.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                <button type="button" className="w-7 h-7 text-[#767676] hover:text-[#a33a1a]" onClick={() => { set(photos.filter((_, k) => k !== i)); setOpen(null) }} aria-label="Remove photo">×</button>
              </span>
            </div>
            {open === i && (
              <div className="border-t border-[#e8e8e8] p-2.5 space-y-2.5">
                <div><label className={label} htmlFor={`cap-${i}`}>Caption (optional)</label><input id={`cap-${i}`} className="field-input" value={p.caption ?? ''} onChange={e => patch(i, { caption: e.target.value })} /></div>
                <div><label className={label} htmlFor={`alt-${i}`}>Describe the photo (for screen readers)</label><input id={`alt-${i}`} className="field-input" value={p.alt ?? ''} onChange={e => patch(i, { alt: e.target.value })} /></div>
                <div>
                  <span className={label}>Size</span>
                  <div className="inline-flex border border-[#cfcfcd]" role="group" aria-label="Photo size">
                    {(['auto', 'large', 'small'] as PhotoSize[]).map(s => (
                      <button key={s} type="button" aria-pressed={(p.size ?? 'auto') === s} onClick={() => patch(i, { size: s === 'auto' ? undefined : s })}
                        className={`px-3 py-1.5 text-[11px] ${(p.size ?? 'auto') === s ? 'bg-black text-white' : 'bg-white'}`}>{s === 'auto' ? 'Auto' : s === 'large' ? 'Large' : 'Small'}</button>
                    ))}
                  </div>
                  <span className={hint}>Auto lets the layout decide. Large always gets a row to itself.</span>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {picker && <MediaPicker multiple onClose={() => setPicker(false)} onSelect={l => add(l.map(toPhoto))} />}
    </div>
  )
}

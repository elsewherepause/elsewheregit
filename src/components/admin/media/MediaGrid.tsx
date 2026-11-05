'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { MediaAsset } from '@prisma/client'
import { deleteMediaAsset, updateMediaAsset } from '@/actions/media.actions'
import { cloudinaryUrl, cloudinaryVideoThumbnail } from '@/lib/utils/cloudinary-url'
import { VIDEO_FORMATS } from '@/lib/upload/prepare-image'

export default function MediaGrid({ assets }: { assets: MediaAsset[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  const [msg, setMsg] = useState<{ id: string; text: string } | null>(null)
  const [pending, start] = useTransition()

  function remove(a: MediaAsset) {
    if (!confirm('Delete this from the media library? This can’t be undone.')) return
    start(async () => {
      const r = await deleteMediaAsset(a.id)
      if (!r.ok) setMsg({ id: a.id, text: r.error })
      else { setMsg(null); router.refresh() }
    })
  }
  function saveAlt(a: MediaAsset) {
    start(async () => {
      const r = await updateMediaAsset(a.id, alt, a.caption ?? '')
      if (!r.ok) setMsg({ id: a.id, text: r.error })
      else { setEditing(null); router.refresh() }
    })
  }

  if (assets.length === 0) return <p className="text-center py-16 text-sm text-[#767676]">No media yet. Upload photos or videos to get started.</p>

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {assets.map(a => {
        const video = VIDEO_FORMATS.includes(a.format)
        const thumb = video ? cloudinaryVideoThumbnail(a.cloudinaryId, { width: 300, height: 300 }) : cloudinaryUrl(a.cloudinaryId, { width: 300, height: 300, crop: 'fill' })
        return (
          <div key={a.id} className="group relative aspect-square bg-[#f5f5f3] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt={a.altText ?? ''} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-end gap-1">
                <button type="button" onClick={() => { setEditing(a.id); setAlt(a.altText ?? '') }} className="bg-white/20 hover:bg-white/40 text-white text-xs px-2 py-1">Alt text</button>
                <button type="button" disabled={pending} onClick={() => remove(a)} className="bg-red-600/90 hover:bg-red-600 text-white text-xs px-2 py-1">Delete</button>
              </div>
              <div className="text-white text-xs opacity-80">{video ? 'Video · ' : ''}{a.width}×{a.height}</div>
            </div>
            {msg?.id === a.id && (
              <div role="alert" className="absolute inset-x-0 bottom-0 bg-[#fdf1ed] text-[#a33a1a] text-[11px] leading-snug p-2">
                {msg.text} <button type="button" className="underline" onClick={() => setMsg(null)}>OK</button>
              </div>
            )}
            {editing === a.id && (
              <div className="absolute inset-0 bg-white p-3 flex flex-col gap-2">
                <label className="text-xs text-[#767676]" htmlFor={`alt-${a.id}`}>Describe the photo (for screen readers)</label>
                <input id={`alt-${a.id}`} value={alt} onChange={e => setAlt(e.target.value)} className="field-input" autoFocus />
                <div className="flex gap-1 mt-auto">
                  <button type="button" onClick={() => saveAlt(a)} disabled={pending} className="flex-1 bg-black text-white text-xs py-1.5">Save</button>
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 border border-[#e8e8e8] text-xs py-1.5">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

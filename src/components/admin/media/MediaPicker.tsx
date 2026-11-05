'use client'

import { useCallback, useEffect, useState } from 'react'
import type { MediaAsset } from '@prisma/client'
import MediaUploader from './MediaUploader'
import { cloudinaryUrl, cloudinaryVideoThumbnail } from '@/lib/utils/cloudinary-url'
import { VIDEO_FORMATS } from '@/lib/upload/prepare-image'
import { SESSION_EXPIRED } from '@/lib/messages'

type Props = {
  onSelect: (assets: MediaAsset[]) => void
  onClose: () => void
  multiple?: boolean
  kind?: 'image' | 'any'
  title?: string
}

export default function MediaPicker({ onSelect, onClose, multiple, kind = 'image', title }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(40)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [picked, setPicked] = useState<MediaAsset[]>([])

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/admin/media?search=${encodeURIComponent(q)}&page=${p}${kind === 'image' ? '&kind=image' : ''}`)
      if (res.status === 401) { setError(SESSION_EXPIRED); return }
      if (!res.ok) { setError('The media library couldn’t be loaded. Try again in a moment.'); return }
      const data = await res.json()
      setAssets(data.assets); setTotal(data.total); setPageSize(data.pageSize ?? 40)
    } catch {
      setError('Couldn’t reach the site. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [kind])

  useEffect(() => {
    const t = setTimeout(() => load(page, search), search ? 250 : 0)
    return () => clearTimeout(t)
  }, [page, search, load])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const pages = Math.max(1, Math.ceil(total / pageSize))
  const isPicked = (a: MediaAsset) => picked.some(p => p.id === a.id)
  function toggle(a: MediaAsset) {
    if (!multiple) { onSelect([a]); onClose(); return }
    setPicked(prev => (prev.some(p => p.id === a.id) ? prev.filter(p => p.id !== a.id) : [...prev, a]))
  }
  function uploaded(list: MediaAsset[]) {
    if (!multiple) { onSelect([list[0]]); onClose(); return }
    setPicked(prev => [...prev, ...list.filter(a => !prev.some(p => p.id === a.id))])
    setPage(1); load(1, search)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title ?? 'Choose media'} className="bg-white w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8]">
          <h2 className="text-sm font-semibold">{title ?? (multiple ? 'Choose photos' : 'Choose a photo')}</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 grid place-items-center text-[#767676] hover:text-black text-xl" aria-label="Close">×</button>
        </div>
        <div className="px-5 py-3 border-b border-[#e8e8e8] grid gap-3 md:grid-cols-[1fr_280px] items-start">
          <input type="search" placeholder="Search by name, alt text or caption" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="field-input" aria-label="Search media" />
          <MediaUploader zone accept={kind} onUploaded={uploaded} />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {error ? <p role="alert" className="text-sm text-[#a33a1a] py-10 text-center">{error}</p>
            : loading ? <p className="text-center py-10 text-sm text-[#767676]">Loading…</p>
            : assets.length === 0 ? <p className="text-center py-10 text-sm text-[#767676]">{search ? 'Nothing matches that search.' : 'Nothing here yet. Upload above.'}</p>
            : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {assets.map(a => {
                  const video = VIDEO_FORMATS.includes(a.format)
                  const on = isPicked(a)
                  return (
                    <button key={a.id} type="button" onClick={() => toggle(a)} aria-pressed={multiple ? on : undefined}
                      className={`aspect-square relative bg-[#f5f5f3] overflow-hidden outline-offset-2 ${on ? 'outline outline-2 outline-black' : 'hover:outline hover:outline-1 hover:outline-[#999]'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={video ? cloudinaryVideoThumbnail(a.cloudinaryId, { width: 240, height: 240 }) : cloudinaryUrl(a.cloudinaryId, { width: 240, height: 240, crop: 'fill' })} alt={a.altText ?? ''} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      {video && <span className="absolute left-1 bottom-1 bg-white text-[9px] font-bold px-1">VIDEO</span>}
                      {on && <span className="absolute right-1 top-1 bg-black text-white text-[10px] font-bold w-5 h-5 grid place-items-center">{picked.findIndex(p => p.id === a.id) + 1}</span>}
                    </button>
                  )
                })}
              </div>
            )}
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#e8e8e8]">
          <div className="flex items-center gap-3 text-xs text-[#767676]">
            {pages > 1 && (
              <>
                <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="hover:text-black disabled:opacity-30">← Prev</button>
                <span>{page} / {pages}</span>
                <button type="button" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="hover:text-black disabled:opacity-30">Next →</button>
              </>
            )}
          </div>
          {multiple && (
            <button type="button" disabled={!picked.length} onClick={() => { onSelect(picked); onClose() }} className="px-4 py-2 bg-black text-white text-xs font-semibold disabled:opacity-30">
              {picked.length ? `Add ${picked.length} ${picked.length === 1 ? 'item' : 'items'}` : 'Select items'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

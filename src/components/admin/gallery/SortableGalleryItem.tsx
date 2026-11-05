'use client'

import { useState, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { GalleryImage, MediaAsset } from '@prisma/client'
import { deleteGalleryImage, updateGalleryImage } from '@/actions/gallery.actions'
import { cloudinaryUrl, cloudinaryVideoThumbnail } from '@/lib/utils/cloudinary-url'

type Item = GalleryImage & { image: MediaAsset }
type Props = { item: Item; onDeleted: (id: string) => void; onUpdated: (id: string, data: Partial<Item>) => void }

export default function SortableGalleryItem({ item, onDeleted, onUpdated }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [form, setForm] = useState({
    altText: item.altText ?? '', caption: item.caption ?? '', description: item.description ?? '',
    category: item.category ?? '', mediaType: item.mediaType, published: item.published,
  })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const thumb = item.mediaType === 'VIDEO'
    ? cloudinaryVideoThumbnail(item.image.cloudinaryId, { width: 100, height: 100 })
    : cloudinaryUrl(item.image.cloudinaryId, { width: 100, height: 100, crop: 'fill' })

  function save() {
    start(async () => {
      const r = await updateGalleryImage(item.id, form)
      if (!r.ok) { setMsg({ ok: false, text: r.error }); return }
      onUpdated(item.id, form)
      setMsg({ ok: true, text: 'Saved. Open Rolls is updated.' })
    })
  }
  function remove() {
    if (!confirm('Remove this from Open Rolls? It stays in the media library.')) return
    start(async () => {
      const r = await deleteGalleryImage(item.id)
      if (!r.ok) setMsg({ ok: false, text: r.error })
      else onDeleted(item.id)
    })
  }

  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }} className="bg-white border border-[var(--color-border)]">
      <div className="flex items-center px-3 py-2.5 gap-3">
        <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#b5b5b5] hover:text-black touch-none px-1" aria-label="Drag to reorder">⠿</button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt="" className="w-12 h-12 object-cover bg-[#f5f5f3] shrink-0" />
        <button type="button" onClick={() => setOpen(v => !v)} className="flex-1 min-w-0 text-left" aria-expanded={open}>
          <span className="block text-sm font-medium truncate">{item.caption || 'Untitled'}</span>
          <span className="block text-xs text-[#767676] mt-0.5">{item.published ? 'Showing' : 'Hidden'}{item.category ? ` · ${item.category}` : ''} · {item.mediaType === 'VIDEO' ? 'Video' : 'Photo'}</span>
        </button>
        <button type="button" onClick={remove} disabled={pending} className="text-xs text-[#a33a1a]/70 hover:text-[#a33a1a]">Remove</button>
      </div>
      {open && (
        <div className="border-t border-[var(--color-border)] p-4 space-y-4">
          <div><label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor={`t-${item.id}`}>Title</label><input id={`t-${item.id}`} className="field-input" value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Shown on hover and in the full-screen view" /></div>
          <div><label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor={`d-${item.id}`}>Caption</label><textarea id={`d-${item.id}`} className="field-input min-h-20" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor={`c-${item.id}`}>Filter group</label>
              <input id={`c-${item.id}`} className="field-input" list="or-cats" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Malnad" />
              <datalist id="or-cats"><option value="Culture" /><option value="Adventure" /></datalist>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor={`m-${item.id}`}>Shows under</label>
              <select id={`m-${item.id}`} className="field-input" value={form.mediaType} onChange={e => setForm(f => ({ ...f, mediaType: e.target.value as Item['mediaType'] }))}>
                <option value="PHOTO">Photos</option><option value="VIDEO">Videos</option>
              </select>
            </div>
          </div>
          <div><label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor={`a-${item.id}`}>Describe the photo (for screen readers)</label><input id={`a-${item.id}`} className="field-input" value={form.altText} onChange={e => setForm(f => ({ ...f, altText: e.target.value }))} /></div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} /> Show in Open Rolls</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={save} disabled={pending} className="px-4 py-1.5 bg-black text-white text-xs font-semibold disabled:opacity-40">{pending ? 'Saving…' : 'Save'}</button>
            {msg && <span role={msg.ok ? 'status' : 'alert'} className={`text-xs ${msg.ok ? 'text-[#1f7a3f]' : 'text-[#a33a1a]'}`}>{msg.text}</span>}
          </div>
        </div>
      )}
    </li>
  )
}

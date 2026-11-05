'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { GalleryImage, MediaAsset } from '@prisma/client'
import { addGalleryImages, reorderGalleryImages } from '@/actions/gallery.actions'
import MediaPicker from '@/components/admin/media/MediaPicker'
import MediaUploader from '@/components/admin/media/MediaUploader'
import SortableGalleryItem from './SortableGalleryItem'

type Item = GalleryImage & { image: MediaAsset }

export default function GalleryAdminClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [picker, setPicker] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  async function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const before = items
    const next = arrayMove(items, items.findIndex(i => i.id === e.active.id), items.findIndex(i => i.id === e.over!.id))
    setItems(next)
    const r = await reorderGalleryImages(next.map(i => i.id))
    if (!r.ok) { setItems(before); setError(r.error) }
  }
  async function add(assets: MediaAsset[]) {
    if (!assets.length) return
    setBusy(true); setError(null)
    const r = await addGalleryImages(assets.map(a => a.id))
    setBusy(false)
    if (!r.ok) { setError(r.error); return }
    setItems(prev => [...r.data, ...prev])
  }

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-[1fr_auto] gap-3 items-start">
        <MediaUploader zone onUploaded={add} />
        <button type="button" disabled={busy} onClick={() => setPicker(true)} className="px-4 py-3 border border-black bg-white text-xs font-semibold disabled:opacity-40">{busy ? 'Adding…' : 'Choose from media'}</button>
      </div>
      {error && <p role="alert" className="text-xs text-[#a33a1a] bg-[#fdf1ed] border border-[#f0c9bd] px-3 py-2">{error}</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map(item => (
              <SortableGalleryItem key={item.id} item={item}
                onDeleted={id => setItems(p => p.filter(i => i.id !== id))}
                onUpdated={(id, d) => setItems(p => p.map(i => (i.id === id ? { ...i, ...d } : i)))} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {items.length === 0 && <p className="border-2 border-dashed border-[var(--color-border)] py-10 text-center text-sm text-[#767676]">Nothing in Open Rolls yet. Upload above.</p>}
      {picker && <MediaPicker multiple kind="any" title="Add to Open Rolls" onClose={() => setPicker(false)} onSelect={add} />}
    </div>
  )
}

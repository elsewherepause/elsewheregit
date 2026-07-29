'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { createGalleryImage, reorderGalleryImages } from '@/actions/gallery.actions'
import { createYoutubeGalleryVideo } from '@/actions/youtube.actions'
import MediaPicker from '@/components/admin/media/MediaPicker'
import SortableGalleryItem from './SortableGalleryItem'
import type { GalleryImage, MediaAsset } from '@prisma/client'

type Item = GalleryImage & { image: MediaAsset | null }

export default function GalleryAdminClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [adding, setAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)

    setItems(reordered)
    await reorderGalleryImages(reordered.map((i) => i.id))
  }

  async function handleAddImage(asset: MediaAsset) {
    setAdding(true)
    const item = await createGalleryImage({
  type: 'PHOTO',
  imageId: asset.id,
})
    setItems((prev) => [...prev, { ...item, image: asset }])
    setAdding(false)
  }

  async function handleAddYoutubeVideo() {
  if (!videoUrl.trim()) return

  setAdding(true)

  try {
    const item = await createYoutubeGalleryVideo(videoUrl)

setItems((prev) => [...prev, item as Item])

    setItems((prev) => [...prev, item as Item])

    setVideoModalOpen(false)
    setVideoUrl('')
  } finally {
    setAdding(false)
  }
}

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function handleUpdated(id: string, data: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }

  return (
    <div className="space-y-2 max-w-3xl">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableGalleryItem
              key={item.id}
              item={item}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
            />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="border-2 border-dashed border-[var(--color-border)] py-10 text-center text-sm text-[var(--color-ink-muted)]">
          No gallery images yet. Add one below.
        </div>
      )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPickerOpen(true)}
            disabled={adding}
            className="py-2.5 border border-dashed border-[var(--color-border)] text-xs uppercase tracking-widest text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
          >
            + Add Image
          </button>

          <button
            onClick={() => setVideoModalOpen(true)}
            disabled={adding}
            className="py-2.5 border border-dashed border-[var(--color-border)] text-xs uppercase tracking-widest text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
          >
            + Add YouTube Video
          </button>
        </div>

      {pickerOpen && (
        <MediaPicker
          onSelect={(asset) => { handleAddImage(asset); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {videoModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="w-full max-w-md rounded bg-white p-6 shadow-xl">
      <h2 className="text-lg font-medium mb-4">
        Add YouTube Video
      </h2>

      <input
        type="url"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className="w-full border border-[var(--color-border)] px-3 py-2"
      />

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={() => {
            setVideoModalOpen(false)
            setVideoUrl('')
          }}
          className="px-4 py-2 border"
        >
          Cancel
        </button>

        <button
          onClick={handleAddYoutubeVideo}
          className="px-4 py-2 bg-black text-white"
        >
          Add Video
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

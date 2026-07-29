'use client'

import { useState } from 'react'
import Image from 'next/image'
import MediaPicker from '@/components/admin/media/MediaPicker'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { GalleryBlockPayload, ImageRef } from '@/lib/types/blocks'
import type { MediaAsset } from '@prisma/client'

type Props = {
  payload: { type: 'GALLERY' } & GalleryBlockPayload
  onChange: (u: Partial<{ type: 'GALLERY' } & GalleryBlockPayload>) => void
}

export default function GalleryEditor({ payload, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)

  function addImage(asset: MediaAsset) {
    if (payload.images.length >= payload.layout) return
    onChange({ images: [...payload.images, { cloudinaryId: asset.cloudinaryId, altText: asset.altText ?? '' }] })
  }

  function removeImage(index: number) {
    onChange({ images: payload.images.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Layout</label>
        <div className="flex gap-2">
          {([2, 3, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => onChange({ layout: n, images: payload.images.slice(0, n) })}
              className={`px-4 py-1.5 text-xs border transition-colors ${payload.layout === n ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' : 'border-[var(--color-border)] hover:border-[var(--color-ink)]'}`}
            >
              {n} images
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-2 grid-cols-${payload.layout}`}>
        {Array.from({ length: payload.layout }).map((_, i) => {
          const img = payload.images[i]
          return img ? (
            <div key={i} className="relative aspect-square group">
              <Image src={cloudinaryUrl(img.cloudinaryId, { width: 200, height: 200, crop: 'fill' })} alt="" fill className="object-cover" />
              <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">Remove</button>
            </div>
          ) : (
            <button
              key={i}
              onClick={() => setPickerOpen(true)}
              className="aspect-square border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] transition-colors"
            >
              +
            </button>
          )
        })}
      </div>

      {pickerOpen && (
        <MediaPicker onSelect={(asset) => { addImage(asset); setPickerOpen(false) }} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  )
}

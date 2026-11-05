'use client'

import { useState } from 'react'
import Image from 'next/image'
import MediaPicker from '@/components/admin/media/MediaPicker'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { ImageTextBlockPayload } from '@/lib/types/blocks'

type Props = {
  payload: { type: 'IMAGE_TEXT' } & ImageTextBlockPayload
  onChange: (u: Partial<{ type: 'IMAGE_TEXT' } & ImageTextBlockPayload>) => void
}

export default function ImageTextEditor({ payload, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Image Position</label>
        <div className="flex gap-2">
          {(['left', 'right'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => onChange({ imagePosition: pos })}
              className={`px-4 py-1.5 text-xs border transition-colors capitalize ${payload.imagePosition === pos ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' : 'border-[var(--color-border)] hover:border-[var(--color-ink)]'}`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Image</label>
        {payload.image?.cloudinaryId ? (
          <div className="relative group h-32">
            <Image
              src={cloudinaryUrl(payload.image.cloudinaryId, { width: 300, height: 200, crop: 'fill' })}
              alt=""
              fill
              className="object-cover"
            />
            <button onClick={() => setPickerOpen(true)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">Change</button>
          </div>
        ) : (
          <button onClick={() => setPickerOpen(true)} className="w-full h-24 border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] transition-colors">
            Select Image
          </button>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Heading</label>
        <input value={payload.heading ?? ''} onChange={(e) => onChange({ heading: e.target.value })} className="field-input" placeholder="Optional heading" />
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Content</label>
        <textarea value={payload.content} onChange={(e) => onChange({ content: e.target.value })} rows={4} className="field-input resize-none" placeholder="Text content…" />
      </div>

      {pickerOpen && (
        <MediaPicker
          onSelect={(asset) => onChange({ image: { cloudinaryId: asset.cloudinaryId, altText: asset.altText ?? '' } })}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}

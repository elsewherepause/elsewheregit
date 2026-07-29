'use client'

import { useState } from 'react'
import Image from 'next/image'
import MediaPicker from '@/components/admin/media/MediaPicker'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { FullWidthImageBlockPayload, PortraitImageBlockPayload, LandscapeImageBlockPayload } from '@/lib/types/blocks'

type Payload =
  | ({ type: 'FULL_WIDTH_IMAGE' } & FullWidthImageBlockPayload)
  | ({ type: 'PORTRAIT_IMAGE' } & PortraitImageBlockPayload)
  | ({ type: 'LANDSCAPE_IMAGE' } & LandscapeImageBlockPayload)

type Props = {
  payload: Payload
  onChange: (u: Partial<Payload>) => void
}

export default function ImageFieldEditor({ payload, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Image</label>
        {payload.image?.cloudinaryId ? (
          <div className="relative group">
            <Image
              src={cloudinaryUrl(payload.image.cloudinaryId, { width: 400, height: 200, crop: 'fill' })}
              alt=""
              width={400}
              height={200}
              className="w-full h-40 object-cover"
            />
            <button
              onClick={() => setPickerOpen(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs"
            >
              Change Image
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full h-32 border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] transition-colors"
          >
            Select Image
          </button>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Caption</label>
        <input
          value={payload.caption ?? ''}
          onChange={(e) => onChange({ caption: e.target.value } as Partial<Payload>)}
          className="field-input"
          placeholder="Optional caption…"
        />
      </div>

      {pickerOpen && (
        <MediaPicker
          onSelect={(asset) => {
            onChange({ image: { cloudinaryId: asset.cloudinaryId, altText: asset.altText ?? '' } } as Partial<Payload>)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}

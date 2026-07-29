'use client'

import Image from 'next/image'
import { useState } from 'react'
import { deleteMediaAsset, updateMediaAsset } from '@/actions/media.actions'
import { cloudinaryUrl, cloudinaryVideoThumbnail } from '@/lib/utils/cloudinary-url'
import type { MediaAsset } from '@prisma/client'

type Props = {
  assets: MediaAsset[]
  selectable?: boolean
  onSelect?: (asset: MediaAsset) => void
}

export default function MediaGrid({ assets, selectable, onSelect }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [altValues, setAltValues] = useState<Record<string, string>>({})

  async function handleDelete(id: string) {
    if (!confirm('Delete this image? This cannot be undone.')) return
    await deleteMediaAsset(id)
  }

  async function handleSaveAlt(asset: MediaAsset) {
    await updateMediaAsset(asset.id, altValues[asset.id] ?? asset.altText ?? '', asset.caption ?? '')
    setEditing(null)
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-[var(--color-ink-muted)]">
        No media yet. Upload some images to get started.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {assets.map((asset) => {
        const isVideo = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'ogv'].includes(asset.format)
        const thumb = isVideo
          ? cloudinaryVideoThumbnail(asset.cloudinaryId, { width: 300, height: 300 })
          : cloudinaryUrl(asset.cloudinaryId, { width: 300, height: 300, crop: 'fill' })
        return (
          <div
            key={asset.id}
            className={`group relative aspect-square bg-[var(--color-admin-bg)] overflow-hidden ${selectable ? 'cursor-pointer' : ''}`}
            onClick={selectable ? () => onSelect?.(asset) : undefined}
          >
            <Image src={thumb} alt={asset.altText ?? ''} fill className="object-cover" sizes="200px" />

            {!selectable && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(asset.id); setAltValues((v) => ({ ...v, [asset.id]: asset.altText ?? '' })) }}
                    className="bg-white/20 hover:bg-white/40 text-white text-xs px-2 py-1 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(asset.id) }}
                    className="bg-red-500/80 hover:bg-red-500 text-white text-xs px-2 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-white text-xs truncate opacity-70">
                  {asset.width}×{asset.height}
                </div>
              </div>
            )}

            {editing === asset.id && !selectable && (
              <div
                className="absolute inset-0 bg-white p-3 flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <label className="text-xs text-[var(--color-ink-muted)]">Alt text</label>
                <input
                  value={altValues[asset.id] ?? ''}
                  onChange={(e) => setAltValues((v) => ({ ...v, [asset.id]: e.target.value }))}
                  className="border border-[var(--color-border)] text-xs px-2 py-1 focus:outline-none focus:border-[var(--color-ink)]"
                  autoFocus
                />
                <div className="flex gap-1 mt-auto">
                  <button onClick={() => handleSaveAlt(asset)} className="flex-1 bg-[var(--color-ink)] text-white text-xs py-1">Save</button>
                  <button onClick={() => setEditing(null)} className="flex-1 border border-[var(--color-border)] text-xs py-1">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

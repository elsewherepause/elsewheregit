'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import MediaUploader from './MediaUploader'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { MediaAsset } from '@prisma/client'

type Props = {
  onSelect: (asset: MediaAsset) => void
  onClose: () => void
}

const PAGE_SIZE = 32

export default function MediaPicker({ onSelect, onClose }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [search, setSearch] = useState('')
  
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  async function load(p: number, q: string) {
    setLoading(true)
    const res = await fetch(`/api/admin/media?search=${encodeURIComponent(q)}&page=${p}`)
    const data = await res.json()
    setAssets(data.assets)
    setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => { load(page, search) }, [page, search])

  function handleSearch(q: string) {
    setSearch(q)
    setPage(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-white w-full max-w-3xl max-h-[80vh] flex flex-col rounded shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-medium">Select Image</h2>
          <div className="flex items-center gap-3">
            <MediaUploader onUploaded={() => load(page, search)} />
            <button onClick={onClose} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] text-xl leading-none">×</button>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-[var(--color-border)]">
        
          <input
            type="search"
            placeholder="Search by alt text…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full text-sm border border-[var(--color-border)] px-3 py-2 focus:outline-none focus:border-[var(--color-ink)]"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-10 text-sm text-[var(--color-ink-muted)]">Loading…</div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => { onSelect(asset); onClose() }}
                  className="aspect-square relative bg-[var(--color-admin-bg)] overflow-hidden hover:ring-2 ring-[var(--color-ink)] transition-all"
                >
                  <Image
                    src={cloudinaryUrl(asset.cloudinaryId, { width: 200, height: 200, crop: 'fill' })}
                    alt={asset.altText ?? ''}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                </button>
              ))}
              {assets.length === 0 && (
                <div className="col-span-4 text-center py-10 text-sm text-[var(--color-ink-muted)]">
                  No images found. Upload some first.
                </div>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="text-xs text-[var(--color-ink-muted)]">
              {page} / {totalPages} &nbsp;·&nbsp; {total} images
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

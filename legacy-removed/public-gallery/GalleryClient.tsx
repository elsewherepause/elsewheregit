'use client'

import { useMemo, useState } from 'react'
import GalleryGrid, { type GalleryItemData } from './GalleryGrid'
import SiteFooter from '@/components/public/SiteFooter'
import type { Note } from '@/actions/note.actions'

type MediaFilter = 'all' | 'PHOTO' | 'VIDEO'

const MEDIA_FILTERS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'PHOTO', label: 'photos' },
  { value: 'VIDEO', label: 'videos' },
]

export default function GalleryClient({
  items,
  categories,
  notes,
  nextProject,
  destinations = [],
}: {
  items: GalleryItemData[]
  categories: string[]
  notes: Note[]
  nextProject?: { slug: string; title: string } | null
  destinations?: { slug: string }[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<MediaFilter>('all')

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (activeCategory && item.category !== activeCategory) return false
        if (activeType !== 'all' && item.mediaType !== activeType) return false
        return true
      }),
    [items, activeCategory, activeType]
  )

  return (
    <div className="pt-28 md:pt-32">
      <div className="max-w-[clamp(1440px,90vw,2200px)] mx-auto px-6 md:px-20">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-16">
          <div className="flex flex-wrap items-center gap-6 md:gap-12">
            <span className="text-sm font-semibold uppercase tracking-widest">Filter</span>
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-6">
                {categories.map((category) => {
                  const active = activeCategory === category
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(active ? null : category)}
                      className="flex items-center gap-1.5 text-sm uppercase tracking-widest hover:opacity-60 transition-opacity"
                      aria-pressed={active}
                    >
                      <span
                        className={`inline-block size-[8px] border border-[var(--color-ink)] ${
                          active ? 'bg-[var(--color-ink)]' : ''
                        }`}
                        aria-hidden="true"
                      />
                      {category}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm uppercase tracking-widest">
            {MEDIA_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveType(value)}
                className={`transition-opacity hover:opacity-60 ${
                  activeType === value ? 'font-bold text-[var(--color-ink)]' : 'text-[#797979]'
                }`}
                aria-pressed={activeType === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <GalleryGrid items={filtered} notes={notes} />
      </div>

      <SiteFooter nextProject={nextProject} destinations={destinations} />
    </div>
  )
}

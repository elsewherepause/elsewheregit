'use client'

import { useEffect, useRef } from 'react'
import type { BlockType } from '@/lib/types/blocks'

const BLOCK_OPTIONS: { type: BlockType; label: string; description: string }[] = [
  { type: 'INTRO', label: 'Intro', description: 'Title, subtitle, description' },
  { type: 'RICH_TEXT', label: 'Rich Text', description: 'Heading + formatted text' },
  { type: 'FULL_WIDTH_IMAGE', label: 'Full Width Image', description: 'Edge-to-edge image' },
  { type: 'IMAGE_TEXT', label: 'Image + Text', description: 'Side-by-side layout' },
  { type: 'PORTRAIT_IMAGE', label: 'Portrait Image', description: 'Tall portrait format' },
  { type: 'LANDSCAPE_IMAGE', label: 'Landscape Image', description: 'Wide landscape format' },
  { type: 'GALLERY', label: 'Gallery', description: '2, 3, or 4 image grid' },
  { type: 'QUOTE', label: 'Quote', description: 'Pull quote with attribution' },
  { type: 'DIVIDER', label: 'Divider', description: 'Horizontal rule' },
  { type: 'SPACER', label: 'Spacer', description: 'Custom whitespace' },
]

type Props = {
  onSelect: (type: BlockType) => void
  onClose: () => void
}

export default function BlockMenu({ onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[var(--color-border)] shadow-lg z-20 max-h-64 overflow-y-auto"
    >
      {BLOCK_OPTIONS.map(({ type, label, description }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-admin-bg)] transition-colors flex items-center justify-between"
        >
          <span className="text-sm">{label}</span>
          <span className="text-xs text-[var(--color-ink-muted)]">{description}</span>
        </button>
      ))}
    </div>
  )
}

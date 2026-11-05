'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { deleteBlock, duplicateBlock } from '@/actions/block.actions'
import BlockEditor from './BlockEditor'
import type { ContentBlock } from '@prisma/client'

type Props = {
  block: ContentBlock
  projectId: string
  onDeleted: (id: string) => void
  onDuplicated: (block: ContentBlock) => void
}

export default function SortableBlock({ block, projectId, onDeleted, onDuplicated }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  async function handleDelete() {
    if (!confirm('Delete this block?')) return
    await deleteBlock(block.id, projectId)
    onDeleted(block.id)
  }

  async function handleDuplicate() {
    const res = await duplicateBlock(block.id, projectId)
    // Optimistically show — page revalidates in background
  }

  const label = block.type.replace(/_/g, ' ')

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-[var(--color-border)] rounded">
      <div className="flex items-center px-3 py-2.5 gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] transition-colors flex-shrink-0 touch-none"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-left text-xs uppercase tracking-widest text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          {label}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            Copy
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-[var(--color-accent)]/60 hover:text-[var(--color-accent)] transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[var(--color-ink-muted)] text-sm leading-none"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-border)] p-4">
          <BlockEditor block={block} projectId={projectId} />
        </div>
      )}
    </div>
  )
}

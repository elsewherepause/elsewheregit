'use client'

import { useState, useOptimistic } from 'react'
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
import { createBlock, reorderBlocks } from '@/actions/block.actions'
import SortableBlock from './SortableBlock'
import BlockMenu from './BlockMenu'
import type { ContentBlock } from '@prisma/client'
import type { BlockType } from '@/lib/types/blocks'

type Props = {
  projectId: string
  initialBlocks: ContentBlock[]
}

export default function BlockBuilder({ projectId, initialBlocks }: Props) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [menuOpen, setMenuOpen] = useState(false)
  const [adding, setAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    const reordered = arrayMove(blocks, oldIndex, newIndex)

    setBlocks(reordered)
    await reorderBlocks(projectId, reordered.map((b) => b.id))
  }

  async function handleAddBlock(type: BlockType) {
    setAdding(true)
    setMenuOpen(false)
    const block = await createBlock(projectId, type)
    setBlocks((prev) => [...prev, block])
    setAdding(false)
  }

  function handleBlockDeleted(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  function handleBlockDuplicated(newBlock: ContentBlock) {
    setBlocks((prev) => [...prev, newBlock])
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              projectId={projectId}
              onDeleted={handleBlockDeleted}
              onDuplicated={handleBlockDuplicated}
            />
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="border-2 border-dashed border-[var(--color-border)] py-10 text-center text-sm text-[var(--color-ink-muted)]">
          No content blocks yet. Add one below.
        </div>
      )}

      <div className="relative pt-2">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          disabled={adding}
          className="w-full py-2.5 border border-dashed border-[var(--color-border)] text-xs uppercase tracking-widest text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-40"
        >
          {adding ? 'Adding…' : '+ Add Block'}
        </button>
        {menuOpen && (
          <BlockMenu onSelect={handleAddBlock} onClose={() => setMenuOpen(false)} />
        )}
      </div>
    </div>
  )
}

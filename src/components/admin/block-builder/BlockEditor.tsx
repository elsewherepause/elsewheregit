'use client'

import { useState, useTransition } from 'react'
import { updateBlock } from '@/actions/block.actions'
import type { ContentBlock } from '@prisma/client'
import type {
  BlockPayload,
  IntroBlockPayload,
  RichTextBlockPayload,
  FullWidthImageBlockPayload,
  PortraitImageBlockPayload,
  LandscapeImageBlockPayload,
  ImageTextBlockPayload,
  GalleryBlockPayload,
  QuoteBlockPayload,
  SpacerBlockPayload,
} from '@/lib/types/blocks'

import IntroEditor from './block-editors/IntroEditor'
import RichTextEditor from './block-editors/RichTextEditor'
import ImageFieldEditor from './block-editors/ImageFieldEditor'
import ImageTextEditor from './block-editors/ImageTextEditor'
import GalleryEditor from './block-editors/GalleryEditor'
import QuoteEditor from './block-editors/QuoteEditor'
import SpacerEditor from './block-editors/SpacerEditor'

type Props = { block: ContentBlock; projectId: string }

export default function BlockEditor({ block, projectId }: Props) {
  const [payload, setPayload] = useState<BlockPayload>({
    type: block.type as BlockPayload['type'],
    ...(block.payload as object),
  } as BlockPayload)
  const [saving, startSave] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleChange(updates: Partial<BlockPayload>) {
    setPayload((prev) => ({ ...prev, ...updates } as BlockPayload))
    setSaved(false)
  }

  function handleSave() {
    startSave(async () => {
      await updateBlock(block.id, projectId, payload)
      setSaved(true)
    })
  }

  function renderEditor() {
    switch (payload.type) {
      case 'INTRO':
        return <IntroEditor payload={payload as { type: 'INTRO' } & IntroBlockPayload} onChange={handleChange as (u: Partial<{ type: 'INTRO' } & IntroBlockPayload>) => void} />
      case 'RICH_TEXT':
        return <RichTextEditor payload={payload as { type: 'RICH_TEXT' } & RichTextBlockPayload} onChange={handleChange as (u: Partial<{ type: 'RICH_TEXT' } & RichTextBlockPayload>) => void} />
      case 'FULL_WIDTH_IMAGE':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ImageFieldEditor payload={payload as any} onChange={handleChange as any} />
      case 'PORTRAIT_IMAGE':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ImageFieldEditor payload={payload as any} onChange={handleChange as any} />
      case 'LANDSCAPE_IMAGE':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ImageFieldEditor payload={payload as any} onChange={handleChange as any} />
      case 'IMAGE_TEXT':
        return <ImageTextEditor payload={payload as { type: 'IMAGE_TEXT' } & ImageTextBlockPayload} onChange={handleChange as (u: Partial<{ type: 'IMAGE_TEXT' } & ImageTextBlockPayload>) => void} />
      case 'GALLERY':
        return <GalleryEditor payload={payload as { type: 'GALLERY' } & GalleryBlockPayload} onChange={handleChange as (u: Partial<{ type: 'GALLERY' } & GalleryBlockPayload>) => void} />
      case 'QUOTE':
        return <QuoteEditor payload={payload as { type: 'QUOTE' } & QuoteBlockPayload} onChange={handleChange as (u: Partial<{ type: 'QUOTE' } & QuoteBlockPayload>) => void} />
      case 'DIVIDER':
        return <p className="text-xs text-[var(--color-ink-muted)] italic">Visual divider — no settings.</p>
      case 'SPACER':
        return <SpacerEditor payload={payload as { type: 'SPACER' } & SpacerBlockPayload} onChange={handleChange as (u: Partial<{ type: 'SPACER' } & SpacerBlockPayload>) => void} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {renderEditor()}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Block'}
        </button>
        {saved && <span className="text-xs text-green-600">Saved ✓</span>}
      </div>
    </div>
  )
}

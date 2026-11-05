import type { QuoteBlockPayload } from '@/lib/types/blocks'

type Props = {
  payload: { type: 'QUOTE' } & QuoteBlockPayload
  onChange: (u: Partial<{ type: 'QUOTE' } & QuoteBlockPayload>) => void
}

export default function QuoteEditor({ payload, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Quote</label>
        <textarea
          value={payload.quote}
          onChange={(e) => onChange({ quote: e.target.value })}
          rows={3}
          className="field-input resize-none"
          placeholder="The quote text…"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Attribution</label>
        <input
          value={payload.attribution ?? ''}
          onChange={(e) => onChange({ attribution: e.target.value })}
          className="field-input"
          placeholder="— Name, Title"
        />
      </div>
    </div>
  )
}

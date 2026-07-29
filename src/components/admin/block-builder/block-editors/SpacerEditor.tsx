import type { SpacerBlockPayload } from '@/lib/types/blocks'

type Props = {
  payload: { type: 'SPACER' } & SpacerBlockPayload
  onChange: (u: Partial<{ type: 'SPACER' } & SpacerBlockPayload>) => void
}

export default function SpacerEditor({ payload, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-[var(--color-ink-muted)]">Height (rem)</label>
      <input
        type="number"
        min={1}
        max={40}
        value={payload.heightRem}
        onChange={(e) => onChange({ heightRem: Number(e.target.value) })}
        className="field-input w-24"
      />
    </div>
  )
}

import type { IntroBlockPayload } from '@/lib/types/blocks'

type Props = {
  payload: { type: 'INTRO' } & IntroBlockPayload
  onChange: (u: Partial<{ type: 'INTRO' } & IntroBlockPayload>) => void
}

export default function IntroEditor({ payload, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Field label="Title">
        <input
          value={payload.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="field-input"
          placeholder="Project title"
        />
      </Field>
      <Field label="Subtitle">
        <input
          value={payload.subtitle ?? ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="field-input"
          placeholder="Optional subtitle"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={payload.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className="field-input resize-none"
          placeholder="Opening paragraph…"
        />
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-[var(--color-ink-muted)]">{label}</label>
      {children}
    </div>
  )
}

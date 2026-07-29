import type { IntroBlockPayload } from '@/lib/types/blocks'

export default function IntroBlock({ payload }: { payload: { type: 'INTRO' } & IntroBlockPayload }) {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
      {payload.subtitle && (
        <p className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] mb-4">
          {payload.subtitle}
        </p>
      )}
      <h2
        className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight max-w-3xl mb-8"
        style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}
      >
        {payload.title}
      </h2>
      {payload.description && (
        <p className="text-base md:text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
          {payload.description}
        </p>
      )}
    </section>
  )
}

import type { QuoteBlockPayload } from '@/lib/types/blocks'

export default function QuoteBlock({ payload }: { payload: { type: 'QUOTE' } & QuoteBlockPayload }) {
  return (
    <section className="px-6 md:px-20 lg:px-32 py-16 md:py-24">
      <blockquote className="border-l-2 border-[var(--color-ink)] pl-8">
        <p
          className="text-2xl md:text-4xl lg:text-5xl font-light leading-tight text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
        >
          &ldquo;{payload.quote}&rdquo;
        </p>
        {payload.attribution && (
          <footer className="mt-6 text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
            {payload.attribution}
          </footer>
        )}
      </blockquote>
    </section>
  )
}

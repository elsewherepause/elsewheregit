import type { RichTextBlockPayload } from '@/lib/types/blocks'
import sanitize from 'sanitize-html'

const ALLOWED_TAGS = ['p', 'strong', 'em', 'a', 'br']
const ALLOWED_ATTRS: sanitize.IOptions['allowedAttributes'] = {
  a: ['href', 'target', 'rel'],
}

export default function RichTextBlock({ payload }: { payload: { type: 'RICH_TEXT' } & RichTextBlockPayload }) {
  const clean = sanitize(payload.html, { allowedTags: ALLOWED_TAGS, allowedAttributes: ALLOWED_ATTRS })

  return (
    <section className="px-6 md:px-12 lg:px-20 py-10 md:py-14">
      <div className="max-w-2xl">
        {payload.heading && (
          <h3
            className="text-2xl md:text-3xl font-light mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {payload.heading}
          </h3>
        )}
        <div
          className="prose-editorial text-base leading-relaxed text-[var(--color-ink)]"
          dangerouslySetInnerHTML={{ __html: clean }}
          style={{ fontFamily: 'var(--font-body)' }}
        />
      </div>
    </section>
  )
}

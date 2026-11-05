import type { Arrangement } from '@/lib/story/layout'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import StoryPhoto from './StoryPhoto'

/** Renders the arrangements the layout engine chose. Rows use flex-grow = aspect ratio: equal heights, no cropping. */
export default function Arrangements({ items }: { items: Arrangement[] }) {
  return (
    <>
      {items.map((a, i) => {
        switch (a.kind) {
          case 'wide':
            return <StoryPhoto key={i} p={a.photos[0]} sizes="(max-width: 767px) 100vw, 1100px" />
          case 'solo':
            return (
              <div key={i} className="st-solo">
                <StoryPhoto p={a.photos[0]} sizes={`(max-width: 767px) 100vw, ${Math.round(11 * a.widthPct)}px`} style={{ width: `${a.widthPct}%` }} />
              </div>
            )
          case 'side':
            return (
              <div key={i} className={`st-side${a.flip ? ' flip' : ''}`}>
                <StoryPhoto p={a.photos[0]} sizes="(max-width: 767px) 100vw, 500px" />
                <p className="t">{renderInlineMarkdown(a.text)}</p>
              </div>
            )
          default:
            return (
              <div key={i} className={`st-row ${a.kind}`}>
                {a.photos.map((p, j) => (
                  <StoryPhoto key={j} p={p} sizes={`(max-width: 767px) 50vw, ${Math.round(1100 / a.photos.length + 200)}px`} style={{ flexGrow: p.w / p.h }} />
                ))}
              </div>
            )
        }
      })}
    </>
  )
}

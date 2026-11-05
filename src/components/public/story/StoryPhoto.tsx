import { photoSrcSet, photoUrl } from '@/lib/utils/cloudinary-url'
import type { StoryPhoto as Photo } from '@/lib/story/types'

/** One uncropped photo. width/height reserve its space so the page never jumps while loading. */
export default function StoryPhoto({ p, sizes, style, eager }: { p: Photo; sizes: string; style?: React.CSSProperties; eager?: boolean }) {
  return (
    <figure className="st-fig" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl(p.id, 1600)}
        srcSet={photoSrcSet(p.id)}
        sizes={sizes}
        width={p.w}
        height={p.h}
        alt={p.alt || p.caption || ''}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {p.caption && <figcaption className="st-cap">{p.caption}</figcaption>}
    </figure>
  )
}

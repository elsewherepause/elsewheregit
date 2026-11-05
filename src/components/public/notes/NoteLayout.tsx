import PhotoFrame from './PhotoFrame'
import type { NotePhoto } from '@/lib/notes/photos'

type Props = { title: string; readTime: string; html: string; photos: NotePhoto[] }

/**
 * A note: title and text in one centred column, then its photos in a rotating frame.
 * Nothing is pinned over the text, so photos can never cover the words.
 */
export default function NoteLayout({ title, readTime, html, photos }: Props) {
  return (
    <div>
      <article className="mx-auto px-6 pt-28 md:pt-36" style={{ maxWidth: 680 }}>
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3 font-sans text-sm">
            <span className="font-medium">Notes</span>
            <span className="text-[#767676]">|</span>
            <span className="uppercase text-[#767676]">{readTime}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-medium leading-snug tracking-wide uppercase" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h1>
        </header>
        <div className="nt-body" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <PhotoFrame photos={photos} />
    </div>
  )
}

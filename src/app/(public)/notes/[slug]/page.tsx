import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteNav from '@/components/public/nav/SiteNav'
import SiteFooter from '@/components/public/SiteFooter'
import NoteLayout from '@/components/public/notes/NoteLayout'
import { getNextNote } from '@/lib/utils/next-project'
import { getAllDestinations } from '@/lib/utils/random-destination'
import { sanitizeNoteHtml } from '@/lib/utils/sanitize'
import { notePhotos } from '@/lib/notes/photos'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const note = await prisma.note.findFirst({ where: { slug, published: true }, select: { title: true } }).catch(() => null)
  if (!note) return {}
  return { title: note.title, alternates: { canonical: `/notes/${slug}` } }
}

export async function generateStaticParams() {
  try {
    const notes = await prisma.note.findMany({ where: { published: true }, select: { slug: true } })
    return notes.map(n => ({ slug: n.slug }))
  } catch {
    return []
  }
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const note = await prisma.note.findFirst({ where: { slug, published: true }, include: { headerImage: true, footerImage: true } })
  if (!note) notFound()
  const [next, destinations] = await Promise.all([getNextNote(slug), getAllDestinations()])
  return (
    <div className="ew-page">
      <SiteNav />
      <main>
        <NoteLayout
          title={note.title}
          readTime={note.readTime}
          html={sanitizeNoteHtml(note.content)}
          photos={notePhotos(note)}
        />
      </main>
      <SiteFooter
        destinations={destinations}
        back={{ href: '/gallery?view=notes', label: 'Back to Open Rolls' }}
        next={next ? { href: `/notes/${next.slug}`, label: `Next note: ${next.title}` } : null}
      />
    </div>
  )
}

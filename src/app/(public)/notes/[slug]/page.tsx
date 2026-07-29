import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteNav from '@/components/public/nav/SiteNav'
import SiteFooter from '@/components/public/SiteFooter'
import NoteLayout from '@/components/public/notes/NoteLayout'
import { getNextProject } from '@/lib/utils/next-project'
import { getAllDestinations } from '@/lib/utils/random-destination'
import { cloudinaryUrl, cloudinaryBlur } from '@/lib/utils/cloudinary-url'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const note = await prisma.note.findUnique({
    where: { slug, published: true },
  })
  if (!note) return {}
  return {
    title: note.title,
    alternates: { canonical: `/notes/${slug}` },
  }
}

export async function generateStaticParams() {
  try {
    const notes = await prisma.note.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return notes.map((n: { slug: string }) => ({ slug: n.slug }))
  } catch {
    return []
  }
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const note = await prisma.note.findUnique({
    where: { slug, published: true },
    include: {
      headerImage: true,
      footerImage: true,
    },
  })

  if (!note) notFound()

  const [nextProject, destinations] = await Promise.all([
    getNextProject(),
    getAllDestinations(),
  ])

  const headerImageData = note.headerImage
    ? {
        cloudinaryId: note.headerImage.cloudinaryId,
        width: note.headerImage.width,
        height: note.headerImage.height,
        altText: note.headerImage.altText,
      }
    : null

  const footerImageData = note.footerImage
    ? {
        cloudinaryId: note.footerImage.cloudinaryId,
        width: note.footerImage.width,
        height: note.footerImage.height,
        altText: note.footerImage.altText,
      }
    : null

  return (
    <>
      <SiteNav />
      <NoteLayout
        title={note.title}
        readTime={note.readTime}
        content={note.content}
        headerImage={headerImageData}
        footerImage={footerImageData}
        headerImageUrl={note.headerImage ? cloudinaryUrl(note.headerImage.cloudinaryId, { width: 600, quality: 'auto' }) : ''}
        headerBlurUrl={note.headerImage ? cloudinaryBlur(note.headerImage.cloudinaryId) : ''}
        footerImageUrl={note.footerImage ? cloudinaryUrl(note.footerImage.cloudinaryId, { width: 1200, quality: 'auto' }) : ''}
        footerBlurUrl={note.footerImage ? cloudinaryBlur(note.footerImage.cloudinaryId) : ''}
      />
      <SiteFooter nextProject={nextProject} destinations={destinations} />
    </>
  )
}

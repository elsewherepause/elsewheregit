import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NoteEditor from './NoteEditor'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const note = await prisma.note.findUnique({ where: { id }, select: { title: true } })
  return { title: note?.title ?? 'Edit Note' }
}

export default async function NoteEditorPage({ params }: Props) {
  const { id } = await params

  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      headerImage: { select: { cloudinaryId: true, altText: true } },
      footerImage: { select: { cloudinaryId: true, altText: true } },
    },
  })

  if (!note) notFound()

  return <NoteEditor note={note} />
}

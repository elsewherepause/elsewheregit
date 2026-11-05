import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NoteEditor from './NoteEditor'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const note = await prisma.note.findUnique({ where: { id }, select: { title: true } })
  return { title: note?.title ?? 'Edit note' }
}

export default async function NoteEditorPage({ params }: Props) {
  const { id } = await params
  const note = await prisma.note.findUnique({
    where: { id },
    include: { headerImage: { select: { cloudinaryId: true, altText: true, width: true, height: true } }, footerImage: { select: { cloudinaryId: true, altText: true, width: true, height: true } } },
  })
  if (!note) notFound()
  // keyed on the id so saving doesn’t reset the editor or hide the “Saved” message
  return <NoteEditor key={note.id} note={note} />
}

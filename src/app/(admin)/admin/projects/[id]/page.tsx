import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import StoryEditor from '@/components/admin/story-editor/StoryEditor'
import { loadStory } from '@/lib/story/load'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const p = await prisma.project.findUnique({ where: { id }, select: { title: true } })
  return { title: p?.title ?? 'Edit story' }
}

export default async function EditStoryPage({ params }: Props) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: 'asc' } }, heroImage: true },
  })
  if (!project) notFound()
  const { story, converted } = await loadStory(project)
  return (
    <StoryEditor
      // keyed on the id (not updatedAt) so saving doesn’t reset the editor or hide the “Saved” message
      key={project.id}
      project={{ id: project.id, title: project.title, slug: project.slug, category: project.category, published: project.published, updatedAt: project.updatedAt.toISOString() }}
      initialStory={story}
      converted={converted}
    />
  )
}

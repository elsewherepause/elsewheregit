import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SLOT_PATTERN } from '@/lib/homepage-slots'
import ProjectEditor from './ProjectEditor'
import Template1Editor from './Template1Editor'
import Template2Editor from './Template2Editor'
import Template3Editor from './Template3Editor'
import Template4Editor from './Template4Editor'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const project = await prisma.project.findUnique({ where: { id }, select: { title: true } })
  return { title: project?.title ?? 'Edit Project' }
}

export default async function ProjectEditorPage({ params }: Props) {
  const { id } = await params

  const [project, publishedProjects] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        blocks: { orderBy: { order: 'asc' } },
        heroImage: true,
        ogImage: true,
      },
    }),
    prisma.project.findMany({
      where: { published: true },
      select: { id: true },
      orderBy: { publishedAt: 'asc' },
    }),
  ])

  if (!project) notFound()

  const slotIndex = publishedProjects.findIndex(p => p.id === id)
  const effectiveIndex = slotIndex >= 0 ? slotIndex : publishedProjects.length
  const homepageSlot = { w: SLOT_PATTERN[effectiveIndex % SLOT_PATTERN.length].w, h: SLOT_PATTERN[effectiveIndex % SLOT_PATTERN.length].h }

  if (project.template === 'TEMPLATE_1') {
    return <Template1Editor project={project} homepageSlot={homepageSlot} />
  }

  if (project.template === 'TEMPLATE_2') {
    return <Template2Editor project={project} homepageSlot={homepageSlot} />
  }

  if (project.template === 'TEMPLATE_3') {
    return <Template3Editor project={project} homepageSlot={homepageSlot} />
  }

  if (project.template === 'TEMPLATE_4') {
    return <Template4Editor project={project} homepageSlot={homepageSlot} />
  }

  return <ProjectEditor project={project} />
}

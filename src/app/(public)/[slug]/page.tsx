import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteNav from '@/components/public/nav/SiteNav'
import SiteFooter from '@/components/public/SiteFooter'
import ProjectHero from '@/components/public/project/ProjectHero'
import BlockRenderer from '@/components/public/project/BlockRenderer'
import type { BlockPayload } from '@/lib/types/blocks'
import { getNextProject } from '@/lib/utils/next-project'
import { getAllDestinations } from '@/lib/utils/random-destination'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    include: { ogImage: true },
  })
  if (!project) return {}

  const title = project.seoTitle || project.title
  const description = project.seoDescription || project.description || ''
  const ogImage = project.ogImage
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_630,c_fill,f_jpg/${project.ogImage.cloudinaryId}`
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: { card: 'summary_large_image', title, description, ...(ogImage && { images: [ogImage] }) },
    alternates: { canonical: `/${slug}` },
  }
}

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return projects.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    include: {
      blocks: { orderBy: { order: 'asc' } },
      heroImage: true,
    },
  })

  if (!project) notFound()

  const [nextProject, destinations] = await Promise.all([
    getNextProject(slug),
    getAllDestinations(),
  ])

  const TEMPLATE_IMPORTS = {
    TEMPLATE_1: () => import('@/components/templates/Template1'),
    TEMPLATE_2: () => import('@/components/templates/Template2'),
    TEMPLATE_3: () => import('@/components/templates/Template3'),
    TEMPLATE_4: () => import('@/components/templates/Template4'),
  } as const

  const templateLoader = TEMPLATE_IMPORTS[project.template as keyof typeof TEMPLATE_IMPORTS]

  if (templateLoader) {
    const Template = (await templateLoader()).default
    const enrichedProject = {
      ...project,
      templateData: {
        ...(typeof project.templateData === 'string'
          ? JSON.parse(project.templateData)
          : (project.templateData as Record<string, unknown>) ?? {}),
        nextProjectTitle: nextProject?.title,
        nextProjectSlug: nextProject?.slug,
        destinations,
      },
    }
    return (
      <>
        <SiteNav />
        <Template project={enrichedProject} />
      </>
    )
  }

  const blocks = project.blocks.map((b) => ({
    ...b,
    payload: { type: b.type, ...(b.payload as object) } as BlockPayload,
  }))

  return (
    <>
      <SiteNav />
      <article>
        <ProjectHero project={project} />
        <div className="max-w-screen-xl mx-auto">
          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </article>
      <SiteFooter nextProject={nextProject} destinations={destinations} />
    </>
  )
}

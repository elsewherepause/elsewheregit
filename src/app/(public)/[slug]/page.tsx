import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteNav from '@/components/public/nav/SiteNav'
import SiteFooter from '@/components/public/SiteFooter'
import StoryView from '@/components/public/story/StoryView'
import { loadStory } from '@/lib/story/load'
import { getNextStory } from '@/lib/utils/next-project'
import { getAllDestinations } from '@/lib/utils/random-destination'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

const getProject = (slug: string) =>
  prisma.project.findFirst({
    where: { slug, published: true },
    include: { blocks: { orderBy: { order: 'asc' } }, heroImage: true, ogImage: true },
  })

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug).catch(() => null)
  if (!project) return {}
  const { story } = await loadStory(project)
  const title = project.seoTitle || story.cover.title || project.title
  const description = project.seoDescription || project.description || [story.cover.location, story.cover.camera].filter(Boolean).join(' · ') || undefined
  const img = project.ogImage?.cloudinaryId ?? story.cover.image?.id
  const ogImage = img ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_630,c_fill,f_jpg/${img}` : undefined
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }) },
    twitter: { card: 'summary_large_image', title, description, ...(ogImage && { images: [ogImage] }) },
    alternates: { canonical: `/${slug}` },
  }
}

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({ where: { published: true }, select: { slug: true } })
    return projects.map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()
  const [{ story }, next, destinations] = await Promise.all([loadStory(project), getNextStory(slug), getAllDestinations()])
  return (
    <div className="ew-page">
      <SiteNav />
      <main><StoryView story={story} /></main>
      <SiteFooter
        destinations={destinations}
        next={next ? { href: `/${next.slug}`, label: `Next story: ${next.title}` } : null}
      />
    </div>
  )
}

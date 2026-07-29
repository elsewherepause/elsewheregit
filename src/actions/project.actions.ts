'use server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils/slugify'
import { z } from 'zod'

const ProjectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  heroImageId: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImageId: z.string().optional().nullable(),
})

export async function createProject(_prevState: { error?: string } | undefined, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  if (!title?.trim()) return { error: 'Title is required.' }

  const rawSlug = (formData.get('slug') as string) || slugify(title)
  const slug = slugify(rawSlug)

  const templateStr = formData.get('template') as string
  const template = (['TEMPLATE_1', 'TEMPLATE_2', 'TEMPLATE_3', 'TEMPLATE_4'].includes(templateStr) ? templateStr : 'TEMPLATE_1') as 'TEMPLATE_1' | 'TEMPLATE_2' | 'TEMPLATE_3' | 'TEMPLATE_4'

  const categoryStr = formData.get('category') as string | null
  const category = categoryStr && ['CULTURE', 'ADVENTURE'].includes(categoryStr)
    ? (categoryStr as 'CULTURE' | 'ADVENTURE')
    : null

  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) return { error: 'A project with this slug already exists.' }

  const project = await prisma.project.create({
    data: { title: title.trim(), slug, template, category },
  })

  revalidatePath('/admin/projects')
  redirect(`/admin/projects/${project.id}`)
}

export async function updateProject(id: string, data: {
  title?: string
  slug?: string
  description?: string
  templateData?: any
  category?: 'CULTURE' | 'ADVENTURE' | null
  heroImageId?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  ogImageId?: string | null
}) {
  await requireAdmin()

  if (data.slug) {
    data.slug = slugify(data.slug)
    const existing = await prisma.project.findFirst({
      where: { slug: data.slug, NOT: { id } },
    })
    if (existing) return { error: 'Slug already in use.' }
  }

  await prisma.project.update({ where: { id }, data })
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${id}`)
}

const TEMPLATE_VALUES = ['TEMPLATE_1', 'TEMPLATE_2', 'TEMPLATE_3', 'TEMPLATE_4'] as const
type TemplateValue = (typeof TEMPLATE_VALUES)[number]

export async function changeProjectTemplate(id: string, template: TemplateValue) {
  await requireAdmin()

  if (!TEMPLATE_VALUES.includes(template)) return { error: 'Invalid template.' }

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return { error: 'Project not found.' }

  const prevData = (project.templateData as Record<string, unknown> | null) ?? {}
  const templateData = { ...prevData, sections: [] }

  await prisma.project.update({ where: { id }, data: { template, templateData } })
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${id}`)
  revalidatePath('/')
}

export async function publishProject(id: string) {
  await requireAdmin()
  const project = await prisma.project.update({
    where: { id },
    data: { published: true, publishedAt: new Date() },
  })
  revalidatePath('/')
  revalidatePath(`/${project.slug}`)
  revalidatePath('/admin/projects')
}

export async function unpublishProject(id: string) {
  await requireAdmin()
  const project = await prisma.project.update({
    where: { id },
    data: { published: false },
  })
  revalidatePath('/')
  revalidatePath(`/${project.slug}`)
  revalidatePath('/admin/projects')
}

export async function deleteProject(id: string) {
  await requireAdmin()
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return

  await prisma.project.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath(`/${project.slug}`)
  revalidatePath('/admin/projects')
  redirect('/admin/projects')
}

export async function duplicateProject(id: string) {
  await requireAdmin()

  const source = await prisma.project.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: 'asc' } } },
  })
  if (!source) throw new Error('Project not found')

  let newSlug = `${source.slug}-copy`
  let attempt = 1
  while (await prisma.project.findUnique({ where: { slug: newSlug } })) {
    newSlug = `${source.slug}-copy-${++attempt}`
  }

  const copy = await prisma.project.create({
    data: {
      title: `${source.title} (Copy)`,
      slug: newSlug,
      description: source.description,
      heroImageId: source.heroImageId,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      ogImageId: source.ogImageId,
      blocks: {
        create: source.blocks.map((b: typeof source.blocks[number]) => ({
          type: b.type,
          order: b.order,
          payload: b.payload as object,
        })),
      },
    },
  })

  revalidatePath('/admin/projects')
  redirect(`/admin/projects/${copy.id}`)
}

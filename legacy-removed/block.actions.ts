'use server'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { BlockType } from '@/lib/types/blocks'
import type { BlockType as PrismaBlockType } from '@prisma/client'

const DEFAULT_PAYLOADS: Record<BlockType, object> = {
  INTRO: { title: '', subtitle: '', description: '' },
  RICH_TEXT: { heading: '', html: '' },
  FULL_WIDTH_IMAGE: { image: { cloudinaryId: '' }, caption: '' },
  IMAGE_TEXT: { image: { cloudinaryId: '' }, heading: '', content: '', imagePosition: 'left' },
  PORTRAIT_IMAGE: { image: { cloudinaryId: '' }, caption: '' },
  LANDSCAPE_IMAGE: { image: { cloudinaryId: '' }, caption: '' },
  GALLERY: { images: [], layout: 2 },
  QUOTE: { quote: '', attribution: '' },
  DIVIDER: {},
  SPACER: { heightRem: 4 },
}

export async function createBlock(projectId: string, type: BlockType) {
  await requireAdmin()

  const last = await prisma.contentBlock.findFirst({
    where: { projectId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const block = await prisma.contentBlock.create({
    data: {
      projectId,
      type: type as PrismaBlockType,
      order: (last?.order ?? -1) + 1,
      payload: DEFAULT_PAYLOADS[type],
    },
  })

  revalidatePath(`/admin/projects/${projectId}`)
  return block
}

export async function updateBlock(id: string, projectId: string, payload: object) {
  await requireAdmin()

  await prisma.contentBlock.update({
    where: { id },
    data: { payload },
  })

  revalidatePath(`/admin/projects/${projectId}`)
}

export async function deleteBlock(id: string, projectId: string) {
  await requireAdmin()
  await prisma.contentBlock.delete({ where: { id } })
  revalidatePath(`/admin/projects/${projectId}`)
}

export async function reorderBlocks(projectId: string, orderedIds: string[]) {
  await requireAdmin()

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.contentBlock.update({ where: { id }, data: { order: index } })
    )
  )

  revalidatePath(`/admin/projects/${projectId}`)
}

export async function duplicateBlock(id: string, projectId: string) {
  await requireAdmin()

  const source = await prisma.contentBlock.findUnique({ where: { id } })
  if (!source) throw new Error('Block not found')

  const last = await prisma.contentBlock.findFirst({
    where: { projectId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  await prisma.contentBlock.create({
    data: {
      projectId,
      type: source.type,
      order: (last?.order ?? source.order) + 1,
      payload: source.payload as object,
    },
  })

  revalidatePath(`/admin/projects/${projectId}`)
}

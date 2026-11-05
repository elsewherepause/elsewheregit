import { Suspense } from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import SiteNav from '@/components/public/nav/SiteNav'
import SiteFooter from '@/components/public/SiteFooter'
import OpenRolls, { type RollItem } from '@/components/public/rolls/OpenRolls'
import { getAllDestinations } from '@/lib/utils/random-destination'

export const revalidate = 300
export const metadata: Metadata = { title: 'Open Rolls', alternates: { canonical: '/gallery' } }

export default async function GalleryPage() {
  const [images, notes, destinations] = await Promise.all([
    prisma.galleryImage.findMany({ where: { published: true }, include: { image: true }, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }).catch(e => { console.error('[gallery]', e); return [] }),
    prisma.note.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, select: { slug: true, title: true, readTime: true } }).catch(() => []),
    getAllDestinations(),
  ])
  const items: RollItem[] = images.map(i => ({
    key: i.id,
    id: i.image.cloudinaryId,
    w: i.image.width || 1500,
    h: i.image.height || 1000,
    type: i.mediaType,
    caption: i.caption,
    description: i.description,
    alt: i.altText,
    category: i.category,
  }))
  return (
    <div className="ew-page">
      <SiteNav />
      <main>
        <Suspense fallback={null}>
          <OpenRolls items={items} notes={notes} />
        </Suspense>
      </main>
      <SiteFooter destinations={destinations} />
    </div>
  )
}

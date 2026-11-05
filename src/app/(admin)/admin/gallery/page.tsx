import { prisma } from '@/lib/prisma'
import GalleryAdminClient from '@/components/admin/gallery/GalleryAdminClient'

export const metadata = { title: 'Open Rolls' }

export default async function AdminGalleryPage() {
  const rows = await prisma.galleryImage.findMany({ where: { imageId: { not: null } }, include: { image: true }, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
  // Entries with no photo attached (from older data) are left out.
  const items = rows.flatMap(r => (r.image ? [{ ...r, image: r.image }] : []))
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>Open Rolls</h1>
      <p className="text-xs text-[#767676] mt-1 mb-6">Photos and videos on the Open Rolls page. New ones go to the top and show first; drag to change the order.</p>
      <GalleryAdminClient initialItems={items} />
    </div>
  )
}

import { getGalleryImages } from '@/actions/gallery.actions'
import GalleryAdminClient from '@/components/admin/gallery/GalleryAdminClient'

export const metadata = { title: 'Gallery' }

export default async function AdminGalleryPage() {
  const items = await getGalleryImages()

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 border-b border-[var(--color-border)] bg-white">
        <h1 className="text-xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
          Gallery
        </h1>
        <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
          Manage standalone gallery images shown on the public Gallery page. Drag to reorder.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <GalleryAdminClient initialItems={items} />
      </div>
    </div>
  )
}

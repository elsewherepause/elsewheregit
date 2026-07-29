import { prisma } from '@/lib/prisma'
import MediaGrid from '@/components/admin/media/MediaGrid'
import MediaUploader from '@/components/admin/media/MediaUploader'

export const metadata = { title: 'Media Library' }

export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
          Media Library
        </h1>
        <MediaUploader />
      </div>
      <MediaGrid assets={assets} />
    </div>
  )
}

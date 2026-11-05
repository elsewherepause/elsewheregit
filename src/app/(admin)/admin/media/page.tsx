import { prisma } from '@/lib/prisma'
import MediaGrid from '@/components/admin/media/MediaGrid'
import MediaPageUploader from './MediaPageUploader'

export const metadata = { title: 'Media' }

export default async function MediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 300 })
  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>Media</h1>
          <p className="text-xs text-[#767676] mt-1">Everything you’ve uploaded. Photos still used somewhere can’t be deleted until they’re removed there.</p>
        </div>
        <div className="w-80"><MediaPageUploader /></div>
      </div>
      <MediaGrid assets={assets} />
    </div>
  )
}

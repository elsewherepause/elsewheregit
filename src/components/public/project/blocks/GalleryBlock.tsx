import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { GalleryBlockPayload } from '@/lib/types/blocks'

export default function GalleryBlock({ payload }: { payload: { type: 'GALLERY' } & GalleryBlockPayload }) {
  if (!payload.images?.length) return null

  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }[payload.layout] ?? 'grid-cols-2'

  return (
    <figure className="my-4 md:my-8">
      <div className={`grid ${colClass} gap-1`}>
        {payload.images.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden">
            <Image
              src={cloudinaryUrl(img.cloudinaryId, { width: 800, height: 800, crop: 'fill' })}
              alt={img.altText ?? ''}
              fill
              className="object-cover"
              sizes={`(max-width: 768px) 50vw, ${Math.round(100 / payload.layout)}vw`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </figure>
  )
}

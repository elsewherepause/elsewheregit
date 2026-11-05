import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { LandscapeImageBlockPayload } from '@/lib/types/blocks'

export default function LandscapeImageBlock({ payload }: { payload: { type: 'LANDSCAPE_IMAGE' } & LandscapeImageBlockPayload }) {
  if (!payload.image?.cloudinaryId) return null
  return (
    <figure className="px-6 md:px-12 lg:px-20 my-10 md:my-16">
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          src={cloudinaryUrl(payload.image.cloudinaryId, { width: 1600, crop: 'fill' })}
          alt={payload.image.altText ?? ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          loading="lazy"
        />
      </div>
      {payload.caption && (
        <figcaption className="mt-3 text-xs text-[var(--color-ink-muted)] italic">
          {payload.caption}
        </figcaption>
      )}
    </figure>
  )
}

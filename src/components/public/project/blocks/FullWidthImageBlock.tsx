import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { FullWidthImageBlockPayload } from '@/lib/types/blocks'

export default function FullWidthImageBlock({ payload }: { payload: { type: 'FULL_WIDTH_IMAGE' } & FullWidthImageBlockPayload }) {
  if (!payload.image?.cloudinaryId) return null
  return (
    <figure className="my-2 md:my-4">
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          src={cloudinaryUrl(payload.image.cloudinaryId, { width: 1920, crop: 'fill' })}
          alt={payload.image.altText ?? ''}
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
        />
      </div>
      {payload.caption && (
        <figcaption className="px-6 md:px-12 mt-3 text-xs text-[var(--color-ink-muted)] italic">
          {payload.caption}
        </figcaption>
      )}
    </figure>
  )
}

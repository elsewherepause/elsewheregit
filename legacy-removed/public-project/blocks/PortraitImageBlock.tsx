import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { PortraitImageBlockPayload } from '@/lib/types/blocks'

export default function PortraitImageBlock({ payload }: { payload: { type: 'PORTRAIT_IMAGE' } & PortraitImageBlockPayload }) {
  if (!payload.image?.cloudinaryId) return null
  return (
    <figure className="px-6 md:px-12 lg:px-20 my-10 md:my-16">
      <div className="relative w-full max-w-md aspect-[2/3] overflow-hidden">
        <Image
          src={cloudinaryUrl(payload.image.cloudinaryId, { width: 800, crop: 'fill', aspectRatio: '2:3' })}
          alt={payload.image.altText ?? ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 40vw"
          loading="lazy"
        />
      </div>
      {payload.caption && (
        <figcaption className="mt-3 text-xs text-[var(--color-ink-muted)] italic max-w-md">
          {payload.caption}
        </figcaption>
      )}
    </figure>
  )
}

import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { ImageTextBlockPayload } from '@/lib/types/blocks'

export default function ImageTextBlock({ payload }: { payload: { type: 'IMAGE_TEXT' } & ImageTextBlockPayload }) {
  if (!payload.image?.cloudinaryId) return null
  const isLeft = payload.imagePosition === 'left'
  return (
    <section className={`flex flex-col md:flex-row gap-0 my-8 md:my-16 ${!isLeft ? 'md:flex-row-reverse' : ''}`}>
      <div className="md:w-1/2 relative aspect-[4/3] overflow-hidden">
        <Image
          src={cloudinaryUrl(payload.image.cloudinaryId, { width: 900, crop: 'fill' })}
          alt={payload.image.altText ?? ''}
          fill
          className="object-cover"
          sizes="50vw"
          loading="lazy"
        />
      </div>
      <div className="md:w-1/2 flex items-center px-8 md:px-14 lg:px-20 py-10 md:py-0">
        <div className="max-w-md">
          {payload.heading && (
            <h3
              className="text-2xl md:text-3xl lg:text-4xl font-light mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {payload.heading}
            </h3>
          )}
          <p className="text-base leading-relaxed text-[var(--color-ink-muted)]">{payload.content}</p>
        </div>
      </div>
    </section>
  )
}

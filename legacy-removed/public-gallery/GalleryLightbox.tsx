'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { cloudinaryUrl, cloudinaryVideoUrl, cloudinaryVideoThumbnail } from '@/lib/utils/cloudinary-url'
import type { GalleryItemData } from './GalleryGrid'

export default function GalleryLightbox({
  item,
  onClose,
}: {
  item: GalleryItemData
  onClose: () => void
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  const isPortrait = item.image.height > item.image.width
  const aspectRatio = item.image.width / item.image.height

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2b2b2b] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-7 right-8 text-white/70 hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <line x1="2" y1="2" x2="26" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="26" y1="2" x2="2" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Content — stop propagation so clicking image/text doesn't close */}
      <div
        className="flex items-center gap-10 md:gap-16 px-8 md:px-20 max-w-[1400px] w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div
          className="flex-shrink-0"
          style={{
            height: 'min(75vh, 700px)',
            width: `calc(min(75vh, 700px) * ${aspectRatio})`,
            maxWidth: isPortrait ? '45vw' : '65vw',
            position: 'relative',
          }}
        >
          {item.mediaType === 'VIDEO' ? (
            <video
              src={cloudinaryVideoUrl(item.image.cloudinaryId, { quality: 'auto' })}
              poster={cloudinaryVideoThumbnail(item.image.cloudinaryId, { width: 1600 })}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <Image
              src={cloudinaryUrl(item.image.cloudinaryId, { width: 1600 })}
              alt={item.altText || ''}
              fill
              className="object-contain"
              sizes="65vw"
              priority
            />
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-3 max-w-xs">
          {item.caption && (
            <h2 className="font-heading text-2xl md:text-3xl font-medium uppercase text-white leading-tight">
              {item.caption}
            </h2>
          )}
          {item.description && (
            <p className="font-sans text-sm md:text-base text-white/60 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

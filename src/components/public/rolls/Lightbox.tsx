'use client'

import { useEffect } from 'react'
import { cloudinaryVideoUrl, cloudinaryVideoThumbnail, photoSrcSet, photoUrl } from '@/lib/utils/cloudinary-url'
import type { RollItem } from './OpenRolls'

export default function Lightbox({ item, onClose, onStep }: { item: RollItem; onClose: () => void; onStep: (d: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose, onStep])

  const ar = item.w / item.h
  const btn = 'absolute top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center text-white/70 hover:text-white'
  return (
    <div className="fixed inset-0 z-[60] bg-[#1f1f1f] flex items-center justify-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.caption || 'Photo'}>
      <button type="button" onClick={onClose} className="absolute top-6 right-6 w-11 h-11 grid place-items-center text-white/70 hover:text-white" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3l18 18M21 3 3 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <button type="button" className={`${btn} left-2 md:left-6`} onClick={e => { e.stopPropagation(); onStep(-1) }} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
      </button>
      <button type="button" className={`${btn} right-2 md:right-6`} onClick={e => { e.stopPropagation(); onStep(1) }} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
      </button>
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-14 px-14 md:px-24 max-w-[1500px] w-full justify-center" onClick={e => e.stopPropagation()}>
        <div style={{ width: `min(${ar >= 1 ? 72 : 46}vw, calc(78vh * ${ar.toFixed(4)}))`, aspectRatio: `${item.w} / ${item.h}` }} className="relative shrink-0">
          {item.type === 'VIDEO' ? (
            <video src={cloudinaryVideoUrl(item.id, { quality: 'auto', crop: '' })} poster={cloudinaryVideoThumbnail(item.id, { width: 1600, crop: '' })} controls autoPlay playsInline className="w-full h-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl(item.id, 2200)} srcSet={photoSrcSet(item.id)} sizes="72vw" alt={item.alt || item.caption || ''} className="w-full h-full object-contain" />
          )}
        </div>
        {(item.caption || item.description) && (
          <div className="max-w-xs text-center md:text-left">
            {item.caption && <h2 className="text-2xl md:text-3xl font-medium uppercase text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>{item.caption}</h2>}
            {item.description && <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed font-sans">{item.description}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

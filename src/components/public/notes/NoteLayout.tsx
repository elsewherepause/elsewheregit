'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { photoSrcSet, photoUrl } from '@/lib/utils/cloudinary-url'

type NoteImage = { cloudinaryId: string; width: number; height: number; altText: string | null }
type Props = { title: string; readTime: string; html: string; headerImage?: NoteImage | null; footerImage?: NoteImage | null }

/**
 * A note: title, text in one centred column, optional header and footer photo.
 * The header photo stays pinned while you read and grows as you reach the end
 * (same effect as before). Without a header photo the page is exactly as tall as its content.
 */
export default function NoteLayout({ title, readTime, html, headerImage, footerImage }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const [pin, setPin] = useState({ scale: 1, pinned: true, lockTop: 0 })

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const vh = window.innerHeight
      let scale = 1
      if (contentRef.current) {
        const trigger = vh * 0.15 + 128 + 300
        const bottom = contentRef.current.getBoundingClientRect().bottom
        if (bottom <= trigger) {
          const p = Math.min(1, (trigger - bottom) / (vh * 0.8))
          scale = 1 + p * p * (Math.min(5, window.innerWidth / 128) - 1)
        }
      }
      const pinned = footerRef.current ? footerRef.current.getBoundingClientRect().top > vh * 0.15 : true
      setPin(prev => {
        const lockTop = !pinned && prev.pinned ? window.scrollY + vh * 0.15 : prev.lockTop
        if (Math.abs(prev.scale - scale) < 0.01 && prev.pinned === pinned && prev.lockTop === lockTop) return prev
        return { scale, pinned, lockTop }
      })
    })
  }, [])

  useEffect(() => {
    if (!headerImage) return
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafRef.current) }
  }, [headerImage, onScroll])

  return (
    <div className="relative">
      {headerImage && (
        <div
          className="left-1/2 z-20 pointer-events-none"
          style={{
            position: pin.pinned ? 'fixed' : 'absolute',
            top: pin.pinned ? '15%' : `${pin.lockTop}px`,
            width: '8rem',
            transform: `translateX(-50%) scale(${pin.scale})`,
            transformOrigin: 'center top',
            willChange: 'transform',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl(headerImage.cloudinaryId, 800)} srcSet={photoSrcSet(headerImage.cloudinaryId)} sizes="640px" width={headerImage.width} height={headerImage.height} alt={headerImage.altText ?? ''} className="w-full h-auto" />
        </div>
      )}

      <article className="relative z-10 mx-auto px-6 pt-28 md:pt-36" style={{ maxWidth: 680 }}>
        {headerImage && <div className="mx-auto mb-6 w-32" style={{ aspectRatio: `${headerImage.width} / ${headerImage.height}` }} aria-hidden="true" />}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3 font-sans text-sm">
            <span className="font-medium">Notes</span>
            <span className="text-[#767676]">|</span>
            <span className="uppercase text-[#767676]">{readTime}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-medium leading-snug tracking-wide uppercase" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h1>
        </header>
        <div ref={contentRef} className="nt-body" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      {/* room for the header photo to grow into */}
      {headerImage && <div aria-hidden="true" style={{ height: '80vh' }} />}

      {footerImage && (
        <div ref={footerRef} className="relative z-20 mx-auto px-6 pt-8" style={{ maxWidth: 680 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl(footerImage.cloudinaryId, 1400)} srcSet={photoSrcSet(footerImage.cloudinaryId)} sizes="680px" width={footerImage.width} height={footerImage.height} alt={footerImage.altText ?? ''} className="w-full h-auto" loading="lazy" />
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

export type ImageAdjust = { x: number; y: number; zoom: number }

type Props = {
  src: string
  alt?: string
  adj?: ImageAdjust
  /** Aspect ratio (width / height) of the containing box. */
  aspect: number
  draggable?: boolean
  style?: React.CSSProperties
  onMouseDown?: (e: React.MouseEvent) => void
}

/**
 * Renders an image to exactly cover its (relatively-positioned, overflow-hidden)
 * parent box, honoring an { x, y, zoom } adjustment.
 *
 * Unlike `objectFit: 'cover'` + `transform: scale(zoom)`, this computes the
 * render size directly from the image's natural aspect ratio, so zoom < 1
 * actually reveals more of the source image instead of just shrinking the
 * already-cropped `cover` result (which can't recover pixels `cover` discarded).
 * Sizing is expressed in percentages of the box, so no pixel measurement of
 * the (possibly fluid/responsive) container is needed — only its aspect ratio.
 */
export default function CroppedImage({ src, alt = '', adj, aspect, draggable = false, style, onMouseDown }: Props) {
  const { x = 50, y = 50, zoom = 1 } = adj ?? {}
  const [imgAspect, setImgAspect] = useState<number | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // onLoad alone misses images the browser already has cached (or loads fast
  // enough that `load` fires before React attaches the listener) — check
  // `.complete` directly once mounted/whenever src changes.
  useEffect(() => {
    setImgAspect(null)
    const el = imgRef.current
    if (el && el.complete && el.naturalWidth) {
      setImgAspect(el.naturalWidth / el.naturalHeight)
    }
  }, [src])

  const fitStyle: React.CSSProperties = imgAspect === null
    ? {
        // Until we know the natural aspect ratio, fall back to plain
        // object-fit:cover — matches the zoom=1 case exactly, avoiding a flash.
        inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: `${x}% ${y}%`,
      }
    : (() => {
        const widthConstrained = aspect >= imgAspect
        const pctW = widthConstrained ? zoom * 100 : zoom * 100 * (imgAspect / aspect)
        const pctH = widthConstrained ? zoom * 100 * (aspect / imgAspect) : zoom * 100
        return {
          width: `${pctW}%`,
          height: `${pctH}%`,
          left: `${(100 - pctW) * (x / 100)}%`,
          top: `${(100 - pctH) * (y / 100)}%`,
          maxWidth: 'none',
        }
      })()

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      draggable={draggable}
      onMouseDown={onMouseDown}
      onLoad={e => setImgAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
      style={{
        position: 'absolute',
        display: 'block',
        ...fitStyle,
        ...style,
      }}
    />
  )
}

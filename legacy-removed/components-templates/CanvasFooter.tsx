'use client'

import TakeMeElsewhere from '@/components/public/TakeMeElsewhere'
import FooterBase from '@/components/public/FooterBase'

type Props = {
  nextProjectSlug?: string
  destinations?: { slug: string }[]
  // Scale factor of the canvas above this footer (viewport width / 1512 design width).
  // FooterBase is used as-is (unscaled) on the About page, where it sits inside that
  // page's own scaled canvas — its fixed px values get scaled along with everything
  // else. Here the footer renders outside the canvas transform, so we scale the same
  // constants manually to land in the same place at any viewport width.
  scale?: number
}

export default function CanvasFooter({ nextProjectSlug, destinations = [], scale = 1 }: Props) {
  return (
    <div style={{ background: '#fff' }}>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: `${60 * scale}px ${88 * scale}px ${40 * scale}px`,
      }}>
        <TakeMeElsewhere
          destinations={destinations}
          style={{
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700,
            fontSize: 16, color: '#ccc', textTransform: 'uppercase',
          }}
        />
        {nextProjectSlug && (
          <a href={`/${nextProjectSlug}`} style={{
            position: 'absolute', right: 88 * scale,
            display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none',
          }}>
            <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase' }}>
              Next project
            </span>
            <span style={{ color: '#1c1c1c', fontSize: 10 }}>▶</span>
          </a>
        )}
      </div>
      <FooterBase scale={scale} />
    </div>
  )
}

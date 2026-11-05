'use client'

import { useState } from 'react'

type SectionEntry = {
  scrollY: number
  headline?: string
}

type Props = {
  visible: boolean
  activeIdx: number
  sections: SectionEntry[]
  scale: number
  onScrollTo: (y: number) => void
}

export default function CanvasSidebar({ visible, activeIdx, sections, scale, onScrollTo }: Props) {
  const [hovered, setHovered] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (!visible) return null

  return (
    <>
      {hovered && (
        <div style={{
          position: 'fixed', inset: 0,
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          zIndex: 19, pointerEvents: 'none',
          transition: 'backdrop-filter 0.3s',
        }} />
      )}

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setHoveredIdx(null) }}
        style={{
          position: 'fixed', left: Math.max(12, 80 * scale), top: '50%',
          transform: 'translateY(-50%)', zIndex: 20,
          display: 'flex', flexDirection: 'column', gap: Math.max(10, 24 * scale),
          pointerEvents: 'auto',
        }}
      >
        {sections.map((sec, i) => {
          const isHov = hoveredIdx === i
          const isActive = i === activeIdx
          const fs = Math.max(9, 12 * scale)
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onScrollTo(sec.scrollY)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isHov && (
                  <div style={{ width: fs * 0.75, height: fs * 0.75, background: '#1c1c1c', flexShrink: 0 }} />
                )}
                <span style={{
                  fontFamily: 'var(--font-sans, Montserrat)',
                  fontSize: isHov ? Math.max(10, 14 * scale) : fs,
                  textTransform: 'uppercase', lineHeight: 'normal',
                  fontWeight: isHov || isActive ? 600 : 400,
                  color: isHov || isActive ? '#1c1c1c' : '#ccc',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s, font-size 0.2s, font-weight 0.2s',
                }}>
                  Section: {String(i + 1).padStart(2, '0')}
                </span>
                {isHov && sec.headline && (
                  <span style={{
                    fontFamily: 'var(--font-sans, Montserrat)',
                    fontSize: Math.max(8, 11 * scale), fontWeight: 400,
                    color: '#505050', lineHeight: 'normal',
                    maxWidth: 300 * scale, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 8,
                  }}>
                    {sec.headline}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

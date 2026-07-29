'use client'

import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import type { ImageAdjust } from '@/components/admin/template-editor/shared'

type Props = {
  // Canvas design width (1512 for Template1-3, 1504 for Template4) — used to center
  // the secondary nav.
  W: number
  titleBold?: string
  heroImage?: string
  heroImageAdjust?: ImageAdjust
  location?: string
  coordinates?: string
  camera?: string
  viewMode: 'story' | 'photos'
  setViewMode: (mode: 'story' | 'photos') => void
  stickyNav: boolean
  isEditing?: boolean
  onImageSelect?: (sectionKey: string, field: string) => void
  cloudName?: string
}

export default function CanvasHeader({
  W, titleBold, heroImage, heroImageAdjust, location, coordinates, camera,
  viewMode, setViewMode, stickyNav, isEditing, onImageSelect, cloudName,
}: Props) {
  const url = heroImage && cloudName
    ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${heroImage}`
    : ''
  const x = heroImageAdjust?.x ?? 50
  const y = heroImageAdjust?.y ?? 50
  const zoom = heroImageAdjust?.zoom ?? 1

  return (
    <>
      {/* ━━━ TITLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', left: 80, top: 89,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400, fontSize: 40,
        color: '#000', textTransform: 'uppercase', lineHeight: 1.15,
        whiteSpace: 'nowrap',
      }}>
        {renderInlineMarkdown(titleBold || 'Project Title')}
      </div>

      {/* ━━━ HERO IMAGE — 1352 × 671 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div
        style={{
          position: 'absolute', left: 80, top: 135, width: 1352, height: 671,
          overflow: 'hidden', background: heroImage ? undefined : isEditing ? '#e8e8e8' : '#fff',
          cursor: isEditing ? 'pointer' : undefined,
        }}
        onClick={isEditing ? () => onImageSelect?.('hero', 'heroImage') : undefined}
      >
        {url && (
          <img
            src={url}
            alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'contain',
              objectPosition: `${x}% ${y}%`,
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: `${x}% ${y}%`, display: 'block',
            }}
          />
        )}
        {isEditing && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: url ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#888', fontFamily: 'var(--font-sans, Montserrat)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
            onMouseLeave={e => (e.currentTarget.style.background = url ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.08)')}
          >
            {url ? <span style={{ color: '#fff', fontSize: 11 }}>Change</span> : <span>+ Image</span>}
          </div>
        )}
      </div>

      {/* ━━━ METADATA BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', left: 80, top: 829,
        width: 795, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 16,
        lineHeight: 'normal',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#ccc' }}>Location:</span>
          <span style={{ color: '#000' }}>{location || ''}</span>
        </div>
        <span style={{ color: '#ccc' }}>{coordinates || ''}</span>
        <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
          <span style={{ color: '#ccc' }}>Camera -</span>
          <span style={{ color: '#000' }}>{camera || ''}</span>
        </div>
      </div>

      {/* ━━━ SECONDARY NAV (Photos / Story) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'absolute', left: 0, top: 871, width: W,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, height: 75, opacity: stickyNav ? 0 : 1,
      }}>
        <span
          onClick={() => setViewMode('photos')}
          style={{
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14,
            textTransform: 'uppercase', cursor: 'pointer',
            color: viewMode === 'photos' ? '#1c1c1c' : '#ccc',
          }}
        >Photos</span>
        <div style={{ height: 31, width: 1, background: '#1c1c1c' }} />
        <span
          onClick={() => setViewMode('story')}
          style={{
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14,
            textTransform: 'uppercase', cursor: 'pointer',
            color: viewMode === 'story' ? '#1c1c1c' : '#ccc',
          }}
        >Story</span>
      </div>
    </>
  )
}

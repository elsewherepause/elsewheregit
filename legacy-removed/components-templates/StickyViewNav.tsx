'use client'

type Props = {
  viewMode: 'story' | 'photos'
  onViewMode: (mode: 'story' | 'photos') => void
}

export default function StickyViewNav({ viewMode, onViewMode }: Props) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 39,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 16, height: 58, pointerEvents: 'none',
    }}>
      <span
        onClick={() => onViewMode('photos')}
        style={{
          fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14,
          textTransform: 'uppercase', cursor: 'pointer', pointerEvents: 'auto',
          color: viewMode === 'photos' ? '#1c1c1c' : '#ccc',
        }}
      >Photos</span>
      <div style={{ height: 20, width: 1, background: '#1c1c1c' }} />
      <span
        onClick={() => onViewMode('story')}
        style={{
          fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 14,
          textTransform: 'uppercase', cursor: 'pointer', pointerEvents: 'auto',
          color: viewMode === 'story' ? '#1c1c1c' : '#ccc',
        }}
      >Story</span>
    </div>
  )
}

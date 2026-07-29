'use client'

import { useRef } from 'react'
import CroppedImage, { type ImageAdjust } from '@/components/shared/CroppedImage'

export type { ImageAdjust }

export const DEFAULT_ADJUST: ImageAdjust = { x: 50, y: 50, zoom: 1 }

/**
 * Drag-to-reposition + zoom crop control. Renders a thumbnail box at the
 * given aspect ratio; dragging inside it moves the focal point, while a
 * plain click (no movement) invokes onPick (e.g. to open a media picker).
 */
export default function ImageAdjustControl({
  cloudName, imageId, label, adj, onPick, onAdjust, onRemove, aspect = 16 / 9,
}: {
  cloudName: string
  imageId?: string
  label: string
  adj: ImageAdjust
  onPick: () => void
  onAdjust: (adj: ImageAdjust) => void
  onRemove?: () => void
  aspect?: number
}) {
  const thumbRef = useRef<HTMLDivElement>(null)
  const url = imageId ? `https://res.cloudinary.com/${cloudName}/image/upload/w_240,q_auto,f_auto/${imageId}` : ''

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const startX = e.clientX, startY = e.clientY
    let moved = false

    function onMove(me: MouseEvent) {
      if (!moved && (Math.abs(me.clientX - startX) > 4 || Math.abs(me.clientY - startY) > 4)) moved = true
      if (moved && thumbRef.current) {
        const rect = thumbRef.current.getBoundingClientRect()
        const x = Math.round(Math.max(0, Math.min(100, ((me.clientX - rect.left) / rect.width) * 100)))
        const y = Math.round(Math.max(0, Math.min(100, ((me.clientY - rect.top) / rect.height) * 100)))
        onAdjust({ ...adj, x, y })
      }
    }
    function onUp() {
      if (!moved) onPick()
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-widest text-gray-400">{label}</label>
      <div
        ref={thumbRef}
        className="w-full relative overflow-hidden border border-dashed border-gray-200 bg-gray-50"
        style={{ aspectRatio: aspect, cursor: url ? 'crosshair' : 'pointer' }}
        onMouseDown={url ? handleMouseDown : undefined}
        onClick={!url ? onPick : undefined}
      >
        {url ? (
          <>
            <CroppedImage
              src={url}
              adj={adj}
              aspect={aspect}
              draggable={false}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            />
            <div style={{ position: 'absolute', left: `${adj.x}%`, top: `${adj.y}%`, transform: 'translate(-50%,-50%)', width: 10, height: 10, border: '2px solid white', borderRadius: '50%', boxShadow: '0 0 0 1px rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: 9, padding: '1px 4px', borderRadius: 2, pointerEvents: 'none', userSelect: 'none' }}>drag · click to change</div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-1">
            <span className="text-lg">+</span>
            <span className="text-[10px]">Add image</span>
          </div>
        )}
      </div>
      {url && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 mr-1">Zoom</span>
          <button onClick={() => onAdjust({ ...adj, zoom: Math.max(0.1, Math.round((adj.zoom - 0.1) * 10) / 10) })} className="w-5 h-5 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-black transition-colors text-xs leading-none">−</button>
          <input
            type="number"
            step="0.01"
            min="0.1"
            max="3"
            value={adj.zoom.toFixed(2)}
            onChange={e => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onAdjust({ ...adj, zoom: Math.min(3, Math.max(0.1, Math.round(v * 100) / 100)) })
            }}
            onBlur={e => {
              const v = parseFloat(e.target.value)
              if (isNaN(v)) onAdjust({ ...adj, zoom: 1 })
            }}
            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
            className="w-12 text-[10px] text-gray-500 text-center tabular-nums border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-black"
          />
          <button onClick={() => onAdjust({ ...adj, zoom: Math.min(3, Math.round((adj.zoom + 0.1) * 10) / 10) })} className="w-5 h-5 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-black transition-colors text-xs leading-none">+</button>
          {(adj.x !== 50 || adj.y !== 50 || adj.zoom !== 1) && (
            <button onClick={() => onAdjust({ x: 50, y: 50, zoom: 1 })} className="text-[10px] text-gray-300 hover:text-gray-600 transition-colors">reset</button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="ml-auto text-[10px] text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

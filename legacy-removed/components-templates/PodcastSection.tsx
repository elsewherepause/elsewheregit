'use client'

import { useEffect, useRef } from 'react'
import { useMusicPlayer } from '@/components/public/MusicPlayerProvider'

type Props = {
  urls: string[]
  compact?: boolean
  // Canvas scale factor (viewport width / 1512 design width). This section renders
  // outside the scaled canvas, in real pixels, but the fixed sidebar (CanvasSidebar)
  // it must clear positions itself at `80 * scale` from the left edge — so the left
  // padding here is tied to the same scale to guarantee clearance at any viewport width.
  scale?: number
}

type SpotifyPlaybackUpdate = { data: { isPaused: boolean; isBuffering: boolean } }
type SpotifyController = {
  addListener: (event: 'playback_update', cb: (e: SpotifyPlaybackUpdate) => void) => void
}
type SpotifyIFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyController) => void
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void
    SpotifyIframeAPILoaded?: boolean
  }
}

const SPOTIFY_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'

// Spotify's script calls `window.onSpotifyIframeApiReady` exactly once, ever,
// per page session — so it can't just be re-registered per embed. Once it has
// fired, later embeds (mounted after that point, e.g. on a project page
// reached via client-side nav after another podcast already loaded) would
// register a handler that never gets called again, and silently never render.
// Caching the resolved API and queuing callbacks until then fixes that.
let spotifyApi: SpotifyIFrameAPI | null = null
let pendingReady: ((api: SpotifyIFrameAPI) => void)[] = []

function loadSpotifyIframeApi(onReady: (api: SpotifyIFrameAPI) => void) {
  if (spotifyApi) {
    onReady(spotifyApi)
    return
  }

  pendingReady.push(onReady)

  if (!window.onSpotifyIframeApiReady) {
    window.onSpotifyIframeApiReady = (api) => {
      spotifyApi = api
      const callbacks = pendingReady
      pendingReady = []
      callbacks.forEach((cb) => cb(api))
    }
  }

  if (document.querySelector(`script[src="${SPOTIFY_API_SRC}"]`)) return

  const script = document.createElement('script')
  script.src = SPOTIFY_API_SRC
  script.async = true
  document.body.appendChild(script)
}

function toSpotifyUri(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname !== 'open.spotify.com') return null
    const [type, id] = u.pathname.replace(/^\/embed\//, '/').split('/').filter(Boolean)
    if (!type || !id) return null
    return `spotify:${type}:${id}`
  } catch {
    return null
  }
}

function PodcastEmbed({ url, marginTop, onPlay }: { url: string; marginTop: number; onPlay: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const uri = toSpotifyUri(url)
    const el = containerRef.current
    if (!uri || !el) return

    let cancelled = false
    loadSpotifyIframeApi((api) => {
      if (cancelled) return
      api.createController(el, { uri, width: '100%', height: 152 }, (controller) => {
        controller.addListener('playback_update', (e) => {
          if (!e.data.isPaused) onPlay()
        })
      })
    })

    return () => {
      cancelled = true
    }
  }, [url, onPlay])

  // Spotify's IFrame API replaces the mount element outright with its own
  // <iframe>, discarding any styling on it — so marginTop has to live on a
  // wrapper that isn't handed to createController, or spacing collapses once
  // the embed loads.
  return (
    <div style={{ marginTop }}>
      <div ref={containerRef} />
    </div>
  )
}

export default function PodcastSection({ urls, compact, scale = 1 }: Props) {
  const valid = urls.filter(Boolean)
  const { requestPause } = useMusicPlayer()
  if (valid.length === 0) return null

  // The sidebar's right edge grows ~155.6px per unit of scale (measured empirically:
  // its `left: Math.max(12, 80*scale)` position plus its proportionally-sized label
  // text). This left padding must grow at least as fast, or clearance shrinks to zero
  // and reverses at large scale (verified: the old flat-ish `170 + 80*scale` formula
  // went negative above scale ~2.25, i.e. viewports wider than ~3400px).
  const padding = compact
    ? '32px 24px'
    : `${48 * scale}px ${88 * scale}px ${48 * scale}px ${90 + 160 * scale}px`

  return (
    <div style={{ background: '#fff', padding }}>
      {valid.map((url, i) => (
        <PodcastEmbed key={i} url={url} marginTop={i > 0 ? 24 : 0} onPlay={requestPause} />
      ))}
    </div>
  )
}

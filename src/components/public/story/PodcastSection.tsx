'use client'

import { useEffect, useRef } from 'react'
import { useMusicPlayer } from '@/components/public/MusicPlayerProvider'

type SpotifyController = { addListener: (event: 'playback_update', cb: (e: { data: { isPaused: boolean } }) => void) => void }
type SpotifyIFrameAPI = {
  createController: (el: HTMLElement, opts: { uri: string; width?: string | number; height?: string | number }, cb: (c: SpotifyController) => void) => void
}
declare global { interface Window { onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void } }

const SRC = 'https://open.spotify.com/embed/iframe-api/v1'
// Spotify calls onSpotifyIframeApiReady only once per page, so cache it and queue callers.
let api: SpotifyIFrameAPI | null = null
let pending: ((a: SpotifyIFrameAPI) => void)[] = []
function load(cb: (a: SpotifyIFrameAPI) => void) {
  if (api) return cb(api)
  pending.push(cb)
  if (!window.onSpotifyIframeApiReady) window.onSpotifyIframeApiReady = a => { api = a; const q = pending; pending = []; q.forEach(f => f(a)) }
  if (document.querySelector(`script[src="${SRC}"]`)) return
  const s = document.createElement('script'); s.src = SRC; s.async = true; document.body.appendChild(s)
}
function toUri(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname !== 'open.spotify.com') return null
    const [type, id] = u.pathname.replace(/^\/embed\//, '/').split('/').filter(Boolean)
    return type && id ? `spotify:${type}:${id}` : null
  } catch { return null }
}

function Embed({ url, onPlay }: { url: string; onPlay: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const uri = toUri(url), el = ref.current
    if (!uri || !el) return
    let cancelled = false
    load(a => { if (!cancelled) a.createController(el, { uri, width: '100%', height: 152 }, c => c.addListener('playback_update', e => { if (!e.data.isPaused) onPlay() })) })
    return () => { cancelled = true }
  }, [url, onPlay])
  // Spotify replaces this element with its iframe, so spacing lives on the wrapper.
  return <div><div ref={ref} /></div>
}

export default function PodcastSection({ urls }: { urls: string[] }) {
  const { requestPause } = useMusicPlayer()
  const valid = urls.filter(u => toUri(u))
  if (!valid.length) return null
  return <section className="st-pod" aria-label="Podcast">{valid.map((u, i) => <Embed key={i} url={u} onPlay={requestPause} />)}</section>
}

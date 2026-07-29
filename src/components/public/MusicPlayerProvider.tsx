'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

type MusicPlayerContextValue = {
  hasStarted: boolean
  start: () => void
  pauseSignal: number
  requestPause: () => void
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // Deferred only when the very first page loaded is the video landing page ('/') —
  // any other entry point (direct link to /home, /about, a project, etc.) starts right away,
  // matching the previous per-page behavior.
  const [hasStarted, setHasStarted] = useState(() => pathname !== '/')
  // Bumped whenever something (e.g. a Spotify podcast embed) starts playing and
  // wants the background music player to pause. MusicPlayer watches this value.
  const [pauseSignal, setPauseSignal] = useState(0)

  const start = useCallback(() => setHasStarted(true), [])
  const requestPause = useCallback(() => setPauseSignal((n) => n + 1), [])

  return (
    <MusicPlayerContext.Provider value={{ hasStarted, start, pauseSignal, requestPause }}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider')
  return ctx
}

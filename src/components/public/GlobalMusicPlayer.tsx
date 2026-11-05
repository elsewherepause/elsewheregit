'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useMusicPlayer } from './MusicPlayerProvider'

// Browser only: the player picks a random track and talks to the audio element.
const MusicPlayer = dynamic(() => import('@/components/public/about/MusicPlayer'), { ssr: false })

/** Mounted once in the root layout. Nothing else in the site renders a player. */
export default function GlobalMusicPlayer() {
  const pathname = usePathname()
  const { hasStarted } = useMusicPlayer()
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) return null
  if (!hasStarted) return null
  return <MusicPlayer />
}

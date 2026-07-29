'use client'

import { usePathname } from 'next/navigation'
import MusicPlayer from '@/components/public/about/MusicPlayer'
import { useMusicPlayer } from './MusicPlayerProvider'

export default function GlobalMusicPlayer() {
  const pathname = usePathname()
  const { hasStarted } = useMusicPlayer()

  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) return null
  if (!hasStarted) return null

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 scale-75 md:scale-100 origin-bottom-right">
      <MusicPlayer />
    </div>
  )
}

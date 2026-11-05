'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMusicPlayer } from '@/components/public/MusicPlayerProvider'

const DESKTOP_SRC = '/videos/welcome.mp4'
const MOBILE_SRC = '/videos/welcome-mobile.mp4'

export default function WelcomeIntro() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ended, setEnded] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)
  const { start: startMusic } = useMusicPlayer()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.src = window.matchMedia('(max-width: 767px)').matches ? MOBILE_SRC : DESKTOP_SRC

    const onEnded = () => { setEnded(true); startMusic() }
    // Media 'error' events don't bubble, so React's onError prop never fires for them —
    // attach directly to the element instead.
    const onError = () => { setEnded(true); startMusic() }

    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onError)
    video.load()

    return () => {
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
    }
  }, [startMusic])

  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-white">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-auto md:h-dvh md:w-auto -translate-x-1/2 -translate-y-1/2 object-cover"
        style={{ maxWidth: 'none' }}
      />

      <AnimatePresence>
        {ended && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onClick={() => router.push('/home')}
            className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-6 text-center cursor-pointer"
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 18,
                lineHeight: 1.6,
                textTransform: 'uppercase',
                maxWidth: 780,
              }}
              className="md:text-[22px]"
            >
              <span style={{ fontWeight: 700, color: '#1c1c1c' }}>
                Elsewhere shapes narratives at the edges{' '}
                of culture, craft, landscape, and meaning, working across documentary, strategy, and brand storytelling. The work begins with people and place, then moves toward form and language, for brands, institutions, and cultural ventures that need more than content.
              </span>
            </p>

            <span
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: ctaHovered ? '#000' : '#ccc',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              Take me elsewhere
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

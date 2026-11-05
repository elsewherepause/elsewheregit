'use client'

import { useEffect, useRef, useState } from 'react'
import { useMusicPlayer } from '@/components/public/MusicPlayerProvider'

const playlist = [
  { title: 'Angel (feat. Horace Andy)', artist: 'Massive Attack', src: '/audio/Massive Attack - Angel - MassiveAttackVEVO.mp3' },
  { title: 'The Spoils ft. Hope Sandoval', artist: 'Massive Attack', src: '/audio/Massive Attack - The Spoils ft. Hope Sandoval - MassiveAttackVEVO.mp3' },
  { title: 'Boiler Room NYC Live Set', artist: 'DARKSIDE', src: '/audio/DARKSIDE Boiler Room NYC Live Set - ALBEGX.mp3' },
  { title: 'From Here To Eternity', artist: 'Giorgio Moroder', src: '/audio/Giorgio Moroder - From Here To Eternity [Remastered] (HD)_128k.mp3' },
  { title: 'Kashmir (Live O2 Arena)', artist: 'Led Zeppelin', src: '/audio/Kashmir (Live_ O2 Arena, London - December 10, 2007)_128k.mp3' },
  { title: 'La Femme d’Argent', artist: 'AIR', src: "/audio/AIR - La femme d'argent (from Moon Safari - Official Audio).mp3" },
  { title: 'Let The Music Play', artist: 'Barry White', src: '/audio/Barry White - Let The Music Play (Official Music Video).mp3' },
  { title: 'Turn The Page (Live)', artist: 'Bob Seger', src: '/audio/Bob Seger & The Silver Bullet Band - Turn The Page (Live At Cobo Hall, Detroit  1975).mp3' },
  { title: 'Boogie Wonderland', artist: 'Earth, Wind & Fire', src: '/audio/Boogie Wonderland (Single Version).mp3' },
  { title: 'Breathe (In the Air)', artist: 'Pink Floyd', src: '/audio/Breathe (In the Air).mp3' },
  { title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', src: '/audio/Do I Wanna Know.mp3' },
  { title: 'Dracula', artist: 'Rob Zombie', src: '/audio/Dracula.mp3' },
  { title: 'Everything In Its Right Place', artist: 'Radiohead', src: '/audio/Everything In Its Right Place.mp3' },
  { title: 'Get Up (Sex Machine)', artist: 'James Brown', src: '/audio/Get Up I Feel Like Being A Sex Machine.mp3' },
  { title: 'Hurt', artist: 'Johnny Cash', src: '/audio/Hurt.mp3' },
  { title: 'I Heard It Through The Grapevine', artist: 'Marvin Gaye', src: '/audio/I Heard It Through The Grapevine.mp3' },
  { title: 'It’s No Good', artist: 'Depeche Mode', src: "/audio/It's No Good.mp3" },
  { title: 'Ladies Night', artist: 'Kool & The Gang', src: '/audio/Ladies Night.mp3' },
  { title: 'Mama, I’m Coming Home', artist: 'Ozzy Osbourne', src: "/audio/OZZY OSBOURNE - Mama, I'm Coming Home (Official Video).mp3" },
  { title: 'No More Tears', artist: 'Ozzy Osbourne', src: '/audio/OZZY OSBOURNE - No More Tears (Official Video).mp3' },
  { title: 'Ordinary World', artist: 'Duran Duran', src: '/audio/Ordinary World.mp3' },
  { title: 'Personal Jesus', artist: 'Depeche Mode', src: '/audio/Personal Jesus.mp3' },
  { title: 'Glory Box (Live at Roseland)', artist: 'Portishead', src: '/audio/Portishead Glory Box Live At Roseland NY ( Best Audio).mp3' },
  { title: 'Precious', artist: 'Depeche Mode', src: '/audio/Precious.mp3' },
  { title: 'Riders on the Storm', artist: 'The Doors', src: '/audio/Riders on the Storm.mp3' },
  { title: 'Signed, Sealed, Delivered', artist: 'Stevie Wonder', src: "/audio/Signed, Sealed, Delivered (I'm Yours).mp3" },
  { title: 'Suzie Q', artist: 'Creedence Clearwater Revival', src: '/audio/Suzie Q.mp3' },
  { title: 'Sweet Pain', artist: 'Kiss', src: '/audio/Sweet Pain.mp3' },
  { title: 'The Less I Know The Better', artist: 'Tame Impala', src: '/audio/The Less I Know The Better.mp3' },
  { title: 'Us and Them', artist: 'Pink Floyd', src: '/audio/Us and Them.mp3' },
]

/** The one music player for the whole site: a small pill docked bottom-right. */
export default function MusicPlayer() {
  // Rendered in the browser only (see GlobalMusicPlayer), so a random start is safe here.
  const [index, setIndex] = useState<number>(() => Math.floor(Math.random() * playlist.length))
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const wantPlay = useRef(true) // try to autoplay the first track
  const { pauseSignal } = useMusicPlayer()

  // Something else (e.g. a podcast) asked for quiet.
  useEffect(() => { audioRef.current?.pause() }, [pauseSignal])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.load()
    if (!wantPlay.current) return
    a.play().catch(() => {
      // Browsers block sound until the visitor interacts; start on the first click or key.
      const resume = () => {
        a.play().catch(() => {})
        document.removeEventListener('pointerdown', resume)
        document.removeEventListener('keydown', resume)
      }
      document.addEventListener('pointerdown', resume, { once: true })
      document.addEventListener('keydown', resume, { once: true })
    })
  }, [index])

  const track = playlist[index]
  const go = (d: number) => { wantPlay.current = playing; setIndex(i => (i + d + playlist.length) % playlist.length) }
  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) { wantPlay.current = true; a.play().catch(() => {}) }
    else { wantPlay.current = false; a.pause() }
  }

  return (
    <div className="ew-pill" role="region" aria-label="Music player">
      <audio ref={audioRef} src={track.src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { wantPlay.current = true; go(1) }} />
      <span className={`ew-disc${playing ? ' is-on' : ''}`} aria-hidden="true" />
      <span className="ew-pill-t">
        <b>{track.title}</b>
        <span>{track.artist}</span>
      </span>
      <span className="ew-pill-btns">
        <button type="button" onClick={() => go(-1)} aria-label="Previous track">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 20 9 12l10-8zM5 19h2V5H5z" /></svg>
        </button>
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause music' : 'Play music'}>
          {playing
            ? <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6zm8-14v14h4V5z" /></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>}
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next track">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 4 10 8-10 8zM19 5h-2v14h2z" /></svg>
        </button>
      </span>
    </div>
  )
}

"use client";

import { useState, useRef, useEffect } from 'react';
import { useMusicPlayer } from '@/components/public/MusicPlayerProvider';

const playlist = [
  {
    title: 'Angel (feat. Horace Andy)',
    artist: 'Massive Attack . Mezzanine',
    src: '/audio/Massive Attack - Angel - MassiveAttackVEVO.mp3'
  },
  {
    title: 'The Spoils ft. Hope Sandoval',
    artist: 'Massive Attack . The Spoils',
    src: '/audio/Massive Attack - The Spoils ft. Hope Sandoval - MassiveAttackVEVO.mp3'
  },
  {
    title: 'Boiler Room NYC Live Set',
    artist: 'DARKSIDE . Boiler Room',
    src: '/audio/DARKSIDE Boiler Room NYC Live Set - ALBEGX.mp3'
  },
  {
    title: 'From Here To Eternity',
    artist: 'Giorgio Moroder',
    src: '/audio/Giorgio Moroder - From Here To Eternity [Remastered] (HD)_128k.mp3'
  },
  {
    title: 'Kashmir (Live O2 Arena)',
    artist: 'Led Zeppelin',
    src: '/audio/Kashmir (Live_ O2 Arena, London - December 10, 2007)_128k.mp3'
  },
  {
    title: 'La Femme d\'Argent',
    artist: 'AIR . Moon Safari',
    src: '/audio/AIR - La femme d\'argent (from Moon Safari - Official Audio).mp3'
  },
  {
    title: 'Let The Music Play',
    artist: 'Barry White',
    src: '/audio/Barry White - Let The Music Play (Official Music Video).mp3'
  },
  {
    title: 'Turn The Page (Live)',
    artist: 'Bob Seger . Cobo Hall 1975',
    src: '/audio/Bob Seger & The Silver Bullet Band - Turn The Page (Live At Cobo Hall, Detroit  1975).mp3'
  },
  {
    title: 'Boogie Wonderland',
    artist: 'Earth, Wind & Fire',
    src: '/audio/Boogie Wonderland (Single Version).mp3'
  },
  {
    title: 'Breathe (In the Air)',
    artist: 'Pink Floyd . Dark Side of the Moon',
    src: '/audio/Breathe (In the Air).mp3'
  },
  {
    title: 'Do I Wanna Know?',
    artist: 'Arctic Monkeys . AM',
    src: '/audio/Do I Wanna Know.mp3'
  },
  {
    title: 'Dracula',
    artist: 'Rob Zombie',
    src: '/audio/Dracula.mp3'
  },
  {
    title: 'Everything In Its Right Place',
    artist: 'Radiohead . Kid A',
    src: '/audio/Everything In Its Right Place.mp3'
  },
  {
    title: 'Get Up (Sex Machine)',
    artist: 'James Brown',
    src: '/audio/Get Up I Feel Like Being A Sex Machine.mp3'
  },
  {
    title: 'Hurt',
    artist: 'Johnny Cash',
    src: '/audio/Hurt.mp3'
  },
  {
    title: 'I Heard It Through The Grapevine',
    artist: 'Marvin Gaye',
    src: '/audio/I Heard It Through The Grapevine.mp3'
  },
  {
    title: 'It\'s No Good',
    artist: 'Depeche Mode . Ultra',
    src: '/audio/It\'s No Good.mp3'
  },
  {
    title: 'Ladies Night',
    artist: 'Kool & The Gang',
    src: '/audio/Ladies Night.mp3'
  },
  {
    title: 'Mama, I\'m Coming Home',
    artist: 'Ozzy Osbourne',
    src: '/audio/OZZY OSBOURNE - Mama, I\'m Coming Home (Official Video).mp3'
  },
  {
    title: 'No More Tears',
    artist: 'Ozzy Osbourne',
    src: '/audio/OZZY OSBOURNE - No More Tears (Official Video).mp3'
  },
  {
    title: 'Ordinary World',
    artist: 'Duran Duran',
    src: '/audio/Ordinary World.mp3'
  },
  {
    title: 'Personal Jesus',
    artist: 'Depeche Mode',
    src: '/audio/Personal Jesus.mp3'
  },
  {
    title: 'Glory Box (Live at Roseland)',
    artist: 'Portishead',
    src: '/audio/Portishead Glory Box Live At Roseland NY ( Best Audio).mp3'
  },
  {
    title: 'Precious',
    artist: 'Depeche Mode',
    src: '/audio/Precious.mp3'
  },
  {
    title: 'Riders on the Storm',
    artist: 'The Doors . L.A. Woman',
    src: '/audio/Riders on the Storm.mp3'
  },
  {
    title: 'Signed, Sealed, Delivered',
    artist: 'Stevie Wonder',
    src: '/audio/Signed, Sealed, Delivered (I\'m Yours).mp3'
  },
  {
    title: 'Suzie Q',
    artist: 'Creedence Clearwater Revival',
    src: '/audio/Suzie Q.mp3'
  },
  {
    title: 'Sweet Pain',
    artist: 'Kiss',
    src: '/audio/Sweet Pain.mp3'
  },
  {
    title: 'The Less I Know The Better',
    artist: 'Tame Impala . Currents',
    src: '/audio/The Less I Know The Better.mp3'
  },
  {
    title: 'Us and Them',
    artist: 'Pink Floyd . Dark Side of the Moon',
    src: '/audio/Us and Them.mp3'
  },
];

export default function MusicPlayer({ style }: { style?: React.CSSProperties }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isFirstTrackEffect = useRef(true);
  const autoplayPending = useRef(false);
  const { pauseSignal } = useMusicPlayer();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    audio.pause();
    setIsPlaying(false);
  }, [pauseSignal]);

  useEffect(() => {
    autoplayPending.current = true;
    setCurrentTrackIndex(Math.floor(Math.random() * playlist.length));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isFirstTrackEffect.current) {
      isFirstTrackEffect.current = false;
      return;
    }

    audio.load();

    if (autoplayPending.current) {
      autoplayPending.current = false;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        const resume = () => {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
          document.removeEventListener('click', resume);
          document.removeEventListener('keydown', resume);
          document.removeEventListener('scroll', resume);
        };
        document.addEventListener('click', resume, { once: true });
        document.addEventListener('keydown', resume, { once: true });
        document.addEventListener('scroll', resume, { once: true });
      });
    } else if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      setIsPlaying(true);
      audioRef.current.play().catch(console.error);
    } else {
      setIsPlaying(false);
      audioRef.current.pause();
    }
  };

  const handleEnded = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const playPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const playNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const currentTrack = playlist[currentTrackIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', ...style }}>
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
        onEnded={handleEnded}
      />

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 8, 
        alignItems: 'center', 
        width: 183
      }}>
        <div style={{ height: 118, position: 'relative', width: 183 }}>

          <img
            alt=""
            src="/icons/vinyl-needle-new.svg"
            style={{
              position: 'absolute',
              width: 60,
              height: 'auto',
              top: 40,
              right: 30,
              zIndex: 20,
              pointerEvents: 'none',
              transformOrigin: '80% 25%',
              transform: isPlaying ? 'rotate(0deg)' : 'rotate(-25deg)',
              transition: 'transform 0.4s ease',
            }}
          />

          <div style={{ position: 'absolute', height: 117.958, left: 14.52, top: -0.14, width: 119.266, overflow: 'hidden' }}>
            <img 
              alt="Vinyl" 
              style={{ 
                position: 'absolute', 
                height: '124.3%', 
                left: '-11.12%', 
                maxWidth: 'none', 
                top: '-12.15%', 
                width: '122.94%',
                animation: 'spin 4s linear infinite',
                animationPlayState: isPlaying ? 'running' : 'paused',
              }}
              src="/images/vinyl-record.png" 
            />
          </div>

          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 14.52, 
            width: 119.266, 
            height: 117.958, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px',
            zIndex: 10
          }}>
            <button onClick={playPrevious} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}>
                <path d="M19 20L9 12L19 4V20Z" />
                <path d="M5 19H7V5H5V19Z" />
              </svg>
            </button>

            <button 
              onClick={togglePlay}
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: '50%', 
                backgroundColor: '#d32f2f', 
                border: 'none',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                cursor: 'pointer',
                color: 'white',
                boxShadow: '0px 2px 5px rgba(0,0,0,0.4)'
              }}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button onClick={playNext} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}>
                <path d="M5 4L15 12L5 20V4Z" />
                <path d="M19 5H17V19H19V5Z" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: 12, color: '#1c1c1c', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', whiteSpace: 'nowrap', fontWeight: 400, marginTop: 4 }}>
          <p style={{ textTransform: 'uppercase', margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentTrack.title}
          </p>
          <p style={{ margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', color: '#666' }}>
            {currentTrack.artist}
          </p>
        </div>
      </div>
    </div>
  )
}



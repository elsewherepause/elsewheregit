'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getNavProjects } from '@/actions/nav.actions'

const PAGE_LABELS: Record<string, string> = {
  '/gallery': 'Open Rolls',
  '/about': 'The Author',
}

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stories, setStories] = useState<{slug: string, title: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const label = pathname.startsWith('/notes/') ? 'Open Rolls' : PAGE_LABELS[pathname]
  const isAbout = pathname === '/about'

  useEffect(() => {
    getNavProjects()
      .then(data => {
        setStories(data || [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Error fetching projects:", err)
        setIsLoading(false)
      })
  }, [])

  const menuButton = (
    <button
      onClick={() => setMenuOpen((v) => !v)}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: menuOpen ? 700 : 500,
        textTransform: 'uppercase',
        color: 'var(--color-ink)',
        letterSpacing: '0.01em',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'font-weight 0.2s',
      }}
      aria-label="Toggle menu"
      aria-expanded={menuOpen}
      aria-controls="site-menu"
    >
      Menu
      {!menuOpen && (
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          border: '1px solid var(--color-ink)',
          flexShrink: 0,
        }} aria-hidden="true" />
      )}
    </button>
  )

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-5 pointer-events-none">
        <Link
          href="/home"
          className={`pointer-events-auto hover:opacity-60 transition-opacity ${menuOpen ? 'invisible' : ''}`}
        >
          <img src="/t1-wordmark.svg" alt=".elsewhere" className="h-[14px] md:h-[18px] w-auto block" />
        </Link>

        <div className="pointer-events-auto flex items-center gap-4 md:gap-10">
          {label && !menuOpen && (
            <span className="hidden md:inline" style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-ink)',
              letterSpacing: '0.01em',
            }}>
              {label}
            </span>
          )}
          {/* On mobile: always show here. On desktop: only show when menu is closed */}
          <span className={menuOpen ? 'md:hidden' : ''}>
            {menuButton}
          </span>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 backdrop-blur-xl bg-white/70"
            id="site-menu"
            onClick={() => setMenuOpen(false)}
          >
            {/* Desktop layout */}
            <div
              className="hidden md:block absolute inset-0 pt-20 px-10 pb-10"
              onClick={e => e.stopPropagation()}
            >
              {/* Top bar: MENU, STORIES column, nav links */}
              <div className="absolute right-0 top-0 px-10 py-5 pointer-events-auto">
                {/* Top line: MENU, STORIES, OPEN ROLLS, THE AUTHOR */}
                <div className="flex items-baseline gap-10">
                  {menuButton}
                  <h2 style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: isAbout ? 500 : 700,
                    textTransform: 'uppercase',
                    color: isAbout ? 'var(--color-ink-muted)' : 'var(--color-ink)',
                    letterSpacing: '0.05em',
                    margin: 0,
                  }}>Stories</h2>

                  <div className="flex gap-6 uppercase items-baseline" style={{ paddingLeft: 80, fontFamily: 'var(--font-sans)', fontSize: 14, letterSpacing: '0.01em' }}>
                    <Link href="/gallery" onClick={() => setMenuOpen(false)} className="cursor-pointer hover:opacity-70 transition-opacity no-underline" style={{ color: 'var(--color-ink)', fontWeight: 500 }}>Open Rolls</Link>
                    <Link href="/about" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity no-underline" style={{ color: 'var(--color-ink)', fontWeight: isAbout ? 700 : 500 }}>
                      The Author <span className="w-1.5 h-1.5 bg-current"></span>
                    </Link>
                  </div>
                </div>

                {/* Stories list directly below heading. Roomy spacing; scrolls inside the screen if there are many stories. */}
                <nav className="flex flex-col gap-[18px] mt-12 overflow-y-auto pr-4" style={{ marginLeft: 85, maxHeight: 'calc(100vh - 150px)' }}>
                  {isLoading ? (
                    <p className="text-lg" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                      Loading stories...
                    </p>
                  ) : stories.length === 0 ? (
                    <p className="text-lg" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                      No stories found.
                    </p>
                  ) : (
                    stories.map((story) => (
                      <Link
                        key={story.slug}
                        href={`/${story.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="text-[var(--color-ink-muted)] font-normal hover:text-[var(--color-ink)] hover:font-bold transition-colors group flex items-center gap-3 text-lg"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          textDecoration: 'none',
                        }}
                      >
                        <span className="w-2 h-2 border border-current flex-shrink-0 group-hover:bg-current transition-colors"></span>
                        <span className="truncate">{story.title}</span>
                      </Link>
                    ))
                  )}
                </nav>
              </div>
            </div>

            {/* Mobile layout (unchanged) */}
            <div
              className="md:hidden absolute inset-0 pt-20 px-6 pb-10 h-full overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-10">
                <h2 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: isAbout ? 500 : 700,
                  textTransform: 'uppercase',
                  color: isAbout ? 'var(--color-ink-muted)' : 'var(--color-ink)',
                  letterSpacing: '0.05em',
                  margin: 0,
                }}>Stories</h2>

                <div className="flex gap-4 uppercase items-center" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, letterSpacing: '0.01em' }}>
                  <Link href="/gallery" onClick={() => setMenuOpen(false)} className="cursor-pointer hover:opacity-70 transition-opacity no-underline" style={{ color: 'var(--color-ink)', fontWeight: 500 }}>Open Rolls</Link>
                  <Link href="/about" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity no-underline" style={{ color: 'var(--color-ink)', fontWeight: isAbout ? 700 : 500 }}>
                    The Author <span className="w-1.5 h-1.5 bg-current"></span>
                  </Link>
                </div>
              </div>

              <nav className="flex flex-col gap-5 pb-24">
                {isLoading ? (
                  <p className="text-base" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                    Loading stories...
                  </p>
                ) : stories.length === 0 ? (
                  <p className="text-base" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink-muted)' }}>
                    No stories found.
                  </p>
                ) : (
                  stories.map((story) => (
                    <Link
                      key={story.slug}
                      href={`/${story.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="text-[var(--color-ink-muted)] font-normal hover:text-[var(--color-ink)] hover:font-bold transition-colors group flex items-center gap-3 text-base"
                      style={{
                        fontFamily: 'var(--font-sans)',
                        textDecoration: 'none',
                      }}
                    >
                      <span className="w-2 h-2 border border-current flex-shrink-0 group-hover:bg-current transition-colors"></span>
                      <span className="truncate">{story.title}</span>
                    </Link>
                  ))
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Story } from '@/lib/story/types'
import { storyPhotos } from '@/lib/story/types'
import { buildSections, type Section } from '@/lib/story/layout'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import { photoSrcSet, photoUrl } from '@/lib/utils/cloudinary-url'
import Arrangements from './Arrangements'
import PodcastSection from './PodcastSection'

type Mode = 'responsive' | 'desktop' | 'narrow'

/**
 * The story page. Used on the live site and as the admin preview, so the preview
 * is always exactly what visitors see. Desktop and phone layouts are both built;
 * CSS shows the right one (or `mode` forces one in the admin preview).
 */
export default function StoryView({ story, mode = 'responsive' }: { story: Story; mode?: Mode }) {
  const [view, setView] = useState<'story' | 'photos'>('story')
  const desktop = useMemo(() => buildSections(story, false), [story])
  const narrow = useMemo(() => buildSections(story, true), [story])
  const chapters = desktop.filter((s): s is Extract<Section, { kind: 'chapter' }> => s.kind === 'chapter')
  const showRail = chapters.length >= 2 && mode !== 'narrow'
  const active = useActiveChapter(chapters.map(c => c.id), view === 'story' && showRail)
  const cover = story.cover
  const photos = storyPhotos(story)
  const meta = [
    ['Location', cover.location],
    ['Coordinates', cover.coordinates],
    ['Camera', cover.camera],
  ].filter(([, v]) => v && v.trim()) as [string, string][]

  return (
    <article className={`st${mode === 'narrow' ? ' is-narrow' : mode === 'desktop' ? ' is-desktop' : ''}`}>
      <header className="st-head">
        <h1 className="st-title">{renderInlineMarkdown(cover.title || 'Untitled story')}</h1>
        {cover.image && (
          <div className="st-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl(cover.image.id, 2200)}
              srcSet={photoSrcSet(cover.image.id)}
              sizes="(max-width: 767px) 100vw, 1440px"
              width={cover.image.w}
              height={cover.image.h}
              alt={cover.image.alt || ''}
              fetchPriority="high"
              // Fill the width, but never taller than 82% of the screen — for any photo shape.
              style={{ width: `min(100%, calc(82vh * ${(cover.image.w / cover.image.h).toFixed(4)}))` }}
            />
          </div>
        )}
        {meta.length > 0 && (
          <dl className="st-meta">
            {meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        )}
        {photos.length > 0 && (
          <div className="st-toggle" role="group" aria-label="View">
            <button type="button" aria-pressed={view === 'photos'} onClick={() => setView('photos')}>Photos</button>
            <i aria-hidden="true" />
            <button type="button" aria-pressed={view === 'story'} onClick={() => setView('story')}>Story</button>
          </div>
        )}
      </header>

      {view === 'photos' ? (
        <div className="st-photo-view">
          {photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${p.id}-${i}`} src={photoUrl(p.id, 1600)} srcSet={photoSrcSet(p.id)} sizes="(max-width: 767px) 100vw, 1100px" width={p.w} height={p.h} alt={p.alt || p.caption || ''} loading="lazy" />
          ))}
        </div>
      ) : (
        <div className={`st-body${showRail ? '' : ' no-rail'}`}>
          {showRail && (
            <nav className="st-rail" aria-label="Chapters">
              {chapters.map(c => (
                <a key={c.id} href={`#ch-${c.id}`} className={active === c.id ? 'on' : undefined}>{c.title}</a>
              ))}
            </nav>
          )}
          <div>
            {mode !== 'narrow' && <Flow sections={desktop} className="st-flow st-only-d" />}
            {mode !== 'desktop' && <Flow sections={narrow} className="st-flow st-only-m" mobile />}
          </div>
        </div>
      )}

      {view === 'story' && story.podcasts && story.podcasts.length > 0 && <PodcastSection urls={story.podcasts} />}
    </article>
  )
}

function Flow({ sections, className, mobile }: { sections: Section[]; className: string; mobile?: boolean }) {
  return (
    <div className={className}>
      {sections.map(s => {
        switch (s.kind) {
          case 'chapter':
            return (
              <div key={s.id} id={mobile ? undefined : `ch-${s.id}`} data-chapter={mobile ? undefined : s.id} className="st-chap">
                <span className="n">{String(s.n).padStart(2, '0')}</span>
                <h2>{s.title}</h2>
              </div>
            )
          case 'text':
            return <div key={s.id} className="st-text">{s.paragraphs.map((p, i) => <p key={i}>{renderInlineMarkdown(p)}</p>)}</div>
          case 'quote':
            return (
              <blockquote key={s.id} className="st-quote">
                {s.text}
                {s.by && <footer>{s.by}</footer>}
              </blockquote>
            )
          case 'photos':
            return <div key={s.id} className="st-photos"><Arrangements items={s.arrangements} /></div>
        }
      })}
    </div>
  )
}

/** Which chapter is currently on screen, for the side list. */
function useActiveChapter(ids: string[], enabled: boolean) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)
  const key = ids.join('|')
  useEffect(() => {
    if (!enabled) return
    const els = key.split('|').map(id => document.querySelector(`[data-chapter="${id}"]`)).filter((e): e is Element => !!e)
    if (!els.length) return
    const onScroll = () => {
      let cur: string | null = els[0].getAttribute('data-chapter')
      for (const el of els) if (el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = el.getAttribute('data-chapter')
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [key, enabled])
  return active
}

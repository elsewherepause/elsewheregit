'use client'

import { useState, useEffect } from 'react'
import type { Section, TemplateData, Pattern } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasPhotosView from './CanvasPhotosView'
import SiteFooter from '@/components/public/SiteFooter'
import PodcastSection from './PodcastSection'

type Props = {
  data: Partial<TemplateData>
  patterns: Pattern[]
  nextProject?: { slug: string; title: string } | null
  destinations?: { slug: string }[]
}

export default function MobileProjectLayout({ data, patterns, nextProject, destinations = [] }: Props) {
  const [viewMode, setViewMode] = useState<'story' | 'photos'>('story')
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll('[id^="mobile-section-"]')
      let active = 0
      sections.forEach((el, i) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.5) active = i
      })
      setActiveSection(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const imgUrl = (id?: string) =>
    id && cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${id}` : ''

  const sections = data.sections ?? []
  const patternCount = patterns.length

  const allImageIds = sections.flatMap(s =>
    [s.image1, s.image2, s.image3, s.image4].filter((id): id is string => !!id)
  )

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      {data.heroImage && (
        <img
          src={imgUrl(data.heroImage)}
          alt=""
          className="w-full h-auto block"
        />
      )}

      {/* Title */}
      <div className="px-6 pt-6 pb-4">
        <h1 style={{
          fontFamily: 'var(--font-serif, DM Sans)',
          fontSize: 28,
          fontWeight: 400,
          textTransform: 'uppercase',
          color: '#000',
          lineHeight: 1.15,
          margin: 0,
        }}>
          {renderInlineMarkdown(data.titleBold || 'Project Title')}
        </h1>
      </div>

      {/* Metadata */}
      <div className="px-6 pb-4 flex flex-wrap gap-x-6 gap-y-1" style={{
        fontFamily: 'var(--font-sans, Montserrat)', fontSize: 12, color: '#999',
      }}>
        {data.location && <span>Location: <span className="text-black">{data.location}</span></span>}
        {data.coordinates && <span>{data.coordinates}</span>}
        {data.camera && <span>Camera: <span className="text-black">{data.camera}</span></span>}
      </div>

      {/* Photos / Story nav */}
      <div className="flex items-center justify-center gap-4 py-4 border-b border-gray-100">
        <button
          onClick={() => setViewMode('photos')}
          className="pb-1"
          style={{
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 13,
            textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer',
            color: viewMode === 'photos' ? '#1c1c1c' : '#ccc',
            borderBottom: viewMode === 'photos' ? '2px solid #1c1c1c' : '2px solid transparent',
          }}
        >Photos</button>
        <button
          onClick={() => setViewMode('story')}
          className="pb-1"
          style={{
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800, fontSize: 13,
            textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer',
            color: viewMode === 'story' ? '#1c1c1c' : '#ccc',
            borderBottom: viewMode === 'story' ? '2px solid #1c1c1c' : '2px solid transparent',
          }}
        >Story</button>
      </div>

      {/* Content */}
      {viewMode === 'photos' ? (
        <CanvasPhotosView imageIds={allImageIds} nextProject={nextProject} destinations={destinations} />
      ) : (
        <>
          {/* Sections */}
          <div className="px-6 py-6">
            {sections.map((s, i) => {
              const pat = patterns[i % patternCount]
              const num = String(i + 1).padStart(2, '0')
              const images = pat.images
                .map(img => ({ id: s[img.field] as string | undefined, label: img.label }))
                .filter(img => img.id)
              const headline = s.headline
              const texts = pat.texts
                .filter(t => t.field !== 'headline' && s[t.field as keyof Section])
                .map(t => ({ value: s[t.field as keyof Section] as string, label: t.label }))

              if (images.length === 0 && !headline && texts.length === 0) return null

              return (
                <div key={i} id={`mobile-section-${i}`} className="mb-10">
                  {/* Section number */}
                  <div style={{
                    fontFamily: 'var(--font-serif, DM Sans)', fontSize: 22, color: '#ccc',
                    marginBottom: 12,
                  }}>{num}</div>

                  {/* Images */}
                  {images.map((img, j) => (
                    <div key={j} className="mb-3">
                      <img
                        src={imgUrl(img.id)}
                        alt=""
                        className="w-full h-auto block"
                        style={{ borderRadius: 4 }}
                      />
                      {img.label && (
                        <p style={{
                          fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800,
                          fontSize: 11, color: '#1c1c1c', textTransform: 'uppercase',
                          marginTop: 4,
                        }}>{s[`caption${j + 1}` as keyof Section] as string | undefined}</p>
                      )}
                    </div>
                  ))}

                  {/* Headline */}
                  {headline && (
                    <h2 style={{
                      fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500, fontSize: 18,
                      color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 1.3,
                      margin: '16px 0 12px', whiteSpace: 'pre-wrap',
                    }}>{headline}</h2>
                  )}

                  {/* Body texts */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {texts.map((t, j) => (
                      <p key={j} style={{
                        fontFamily: 'var(--font-sans, Montserrat)', fontSize: 13, color: '#505050',
                        lineHeight: 1.5, textAlign: 'justify', margin: 0,
                        gridColumn: texts.length === 1 || j === texts.length - 1 && texts.length % 2 !== 0 ? '1 / -1' : undefined,
                      }}>{renderInlineMarkdown(t.value)}</p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Section progress bar */}
          {sections.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-3">
              <button
                onClick={() => setSectionMenuOpen(v => !v)}
                className="w-full flex items-center justify-center gap-3"
                style={{
                  fontFamily: 'var(--font-sans, Montserrat)', fontSize: 12, color: '#999',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                <span style={{
                  width: 8, height: 8, background: '#1c1c1c', display: 'inline-block',
                }} />
                <span>Section {String(activeSection + 1).padStart(2, '0')} of {String(sections.length).padStart(2, '0')}</span>
              </button>

              {sectionMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 shadow-lg max-h-60 overflow-y-auto">
                  {sections.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSectionMenuOpen(false)
                        document.getElementById(`mobile-section-${i}`)?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="block w-full text-left py-2 hover:opacity-60 transition-opacity"
                      style={{
                        fontFamily: 'var(--font-sans, Montserrat)', fontSize: 14,
                        color: '#505050', background: 'none', border: 'none', cursor: 'pointer',
                      }}
                    >
                      <span style={{ color: '#ccc', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                      {s.headline || `Section ${String(i + 1).padStart(2, '0')}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {Array.isArray(data.podcastSpotifyUrls) && data.podcastSpotifyUrls.length > 0 && (
            <PodcastSection urls={data.podcastSpotifyUrls} compact />
          )}

          <SiteFooter nextProject={nextProject} destinations={destinations} />
        </>
      )}
    </div>
  )
}

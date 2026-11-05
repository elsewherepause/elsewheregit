'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

// ─── Data type ────────────────────────────────────────────────────────────────

import { hasContent, type ImageAdjust, type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasHeader from './CanvasHeader'
import CanvasPhotosView from './CanvasPhotosView'
import CanvasSidebar from './CanvasSidebar'
import PodcastSection from './PodcastSection'
import StickyViewNav from './StickyViewNav'
export type Template3Data = TemplateData

const FIELD_MAPS: Record<string, string>[] = [
  { image1: 'sec1Image', headline: 'sec1Headline', body1: 'sec1Body1', quote: 'sec1Quote', body2: 'sec1Body2', quote2: 'sec1Quote2', body3: 'sec1Body3' },
  { image1: 'sec2Image', headline: 'sec2Headline', body1: 'sec2Body1', body2: 'sec2Body2' },
  { image1: 'sec3Image', headline: 'sec3Headline', body1: 'sec3Body1', body2: 'sec3Body2' },
  { image1: 'sec4ImageTall', headline: 'sec4Headline', quote: 'sec4Quote', body1: 'sec4Body1', body2: 'sec4Body2' },
  { image2: 'sec5ImagePortrait', headline: 'sec5Headline', quote: 'sec5Quote', body3: 'sec5Body3', body4: 'sec5Body4' },
  { image1: 'sec6Image', headline: 'sec6Headline', quote: 'sec6Quote', body2: 'sec6Body2', body3: 'sec6Body3', body4: 'sec6Body4' },
  { image1: 'sec7Image', headline: 'sec7Headline', body1: 'sec7Body1', body2: 'sec7Body2' },
]

function sectionsToFlat(sections: Section[]): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {}
  for (let i = 0; i < sections.length && i < FIELD_MAPS.length; i++) {
    const s = sections[i]
    const map = FIELD_MAPS[i % FIELD_MAPS.length]
    for (const [sectionKey, flatKey] of Object.entries(map)) {
      const val = s[sectionKey as keyof Section]
      if (typeof val === 'string') flat[flatKey] = val
    }
  }
  return flat
}

// ─── Canvas constants (W=1512) ───────────────────────────────────────────────

const W = 1512

// Y where each pattern's topmost element begins (absolute in the original canvas)
const SECTION_STARTS = [1009, 1568, 2773, 3387, 4042, 4687, 5341]

// Vertical slot height of each pattern
const SECTION_HEIGHTS = [561, 900, 857, 1100, 658, 900, 600]

// Where content starts (top of first pattern's slot) — shifted up 50px from the
// original 1009 to tighten the whitespace between the header and the title/hero
const CONTENT_TOP = 959

// Bottom of the deepest element in each pattern at offset=0
const SECTION_CONTENT_BOTTOMS = [1570, 2220, 3630, 4250, 4700, 5370, 6100]


// ─── Component ────────────────────────────────────────────────────────────────

export default function Template3Layout({
  data: rawData,
  isEditing = false,
  onImageSelect,
}: {
  data: Partial<Template3Data>
  isEditing?: boolean
  onImageSelect?: (sectionIndex: string, field: string) => void
}) {
  const flat = rawData.sections ? sectionsToFlat(rawData.sections) : {}
  const data = { ...rawData, ...flat } as Record<string, string | undefined>
  const rawSections = rawData.sections ?? []
  const activeSections = isEditing
    ? rawSections
    : rawSections.filter(s => hasContent(s))

  const [scale, setScale] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'story' | 'photos'>('story')
  const [stickyNav, setStickyNav] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Cumulative Y offset per section index
  function sectionOffset(i: number): number {
    const pat = i % 7
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 7]
    return (CONTENT_TOP + cumH) - SECTION_STARTS[pat]
  }

  const lastIdx = activeSections.length - 1
  const lastContentBottom = lastIdx >= 0
    ? SECTION_CONTENT_BOTTOMS[lastIdx % 7] + sectionOffset(lastIdx)
    : CONTENT_TOP

  const allImageIds = activeSections.flatMap(s =>
    [s.image1, s.image2, s.image3, s.image4].filter((id): id is string => !!id)
  )

  const HEADER_END = 946
  const storyFooterY = lastContentBottom + 60
  const storyCanvasH = storyFooterY
  const canvasH = viewMode === 'photos' ? HEADER_END : storyCanvasH

  const sidebarSections = activeSections.map((s, i) => {
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 7]
    return { scrollY: CONTENT_TOP + cumH, headline: s.headline }
  })

  useEffect(() => {
    if (isEditing) return
    const onScroll = () => {
      if (!wrapperRef.current) return
      setStickyNav(wrapperRef.current.getBoundingClientRect().top + HEADER_END * scale < 60)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scale, isEditing])

  const handleScrollTo = useCallback((y: number) => {
    if (!wrapperRef.current) return
    const wrapperTop = wrapperRef.current.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: wrapperTop + y * scale, behavior: 'smooth' })
  }, [scale])

  useEffect(() => {
    const update = () => {
      const el = wrapperRef.current
      if (!el) return
      setScale((el.parentElement?.clientWidth ?? window.innerWidth) / W)
    }
    update()
    const ro = new ResizeObserver(update)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (isEditing) return
    const onScroll = () => {
      const el = wrapperRef.current
      if (!el) return
      const canvasTop = el.getBoundingClientRect().top
      const pivotY = (window.innerHeight * 0.4 - canvasTop) / scale
      setSidebarVisible(pivotY >= CONTENT_TOP && pivotY <= lastContentBottom)
      let active = 0
      for (let i = 0; i < activeSections.length; i++) {
        let cumH = 0
        for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 7]
        if (CONTENT_TOP + cumH <= pivotY) active = i
      }
      setActiveIdx(active)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scale, isEditing])

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const imgUrl = (id?: string) =>
    id && cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${id}` : ''

  function ImgBox({ id, si, field, l, t, w, h, cap, adj }: {
    id?: string; si: string; field: string; l: number; t: number; w: number; h: number; cap?: string; adj?: ImageAdjust
  }) {
    const url = imgUrl(id)
    const x = adj?.x ?? 50
    const y = adj?.y ?? 50
    const zoom = adj?.zoom ?? 1
    return (
      <>
        <div
          style={{
            position: 'absolute', left: l, top: t, width: w, height: h,
            overflow: 'hidden', background: id ? undefined : isEditing ? '#e8e8e8' : '#fff',
            cursor: isEditing ? 'pointer' : undefined,
          }}
          onClick={isEditing ? () => onImageSelect?.(si, field) : undefined}
        >
          {url && <img src={url} alt={cap || ''} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: `${x}% ${y}%`, transform: zoom !== 1 ? `scale(${zoom})` : undefined, transformOrigin: `${x}% ${y}%`, display: 'block' }} />}
          {isEditing && (
            <div
              style={{
                position: 'absolute', inset: 0,
                background: url ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#888', fontFamily: 'var(--font-sans, Montserrat)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.background = url ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.08)')}
            >
              {url ? <span style={{ color: '#fff', fontSize: 11 }}>Change</span> : <span>+ Image</span>}
            </div>
          )}
        </div>
        {cap && (
          <div style={{
            position: 'absolute', left: l + 31, top: t + h + 4,
            fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 800,
            fontSize: 14, color: '#1c1c1c', textTransform: 'uppercase',
          }}>{cap}</div>
        )}
      </>
    )
  }

  function SecNum({ n, l, t }: { n: string; l: number; t: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400, fontSize: 28,
        color: '#ccc', textTransform: 'uppercase', lineHeight: 'normal',
      }}>{n}</div>
    )
  }

  // Standardized gap from the bottom of the heading's last rendered line to
  // the body text. Headline line count depends on how the text actually
  // wraps at render width, so the body position is measured off the
  // heading's real rendered height rather than a fixed offset.
  const HEADING_BODY_GAP = 10

  // rows stack vertically below the heading: row 0 sits at the heading's real
  // measured bottom + GAP (e.g. the "Body intro" quote), and every row after
  // that sits at the row above it's real measured bottom + GAP — so a short
  // quote (or short body row) no longer leaves an oversized gap before
  // whatever comes next.
  function HeadingRow({ headline, hl, ht, hw = 421, size = 22, rows }: {
    headline?: string; hl: number; ht: number; hw?: number; size?: number
    rows: { text?: string; l: number; w?: number }[][]
  }) {
    const ref = useRef<HTMLDivElement>(null)
    const [headingHeight, setHeadingHeight] = useState(0)

    useLayoutEffect(() => {
      const el = ref.current
      if (!el) return
      const update = () => setHeadingHeight(el.offsetHeight)
      update()
      const ro = new ResizeObserver(update)
      ro.observe(el)
      return () => ro.disconnect()
    }, [headline, hw])

    const firstRowTop = ht + headingHeight + HEADING_BODY_GAP

    return (
      <>
        <div ref={ref} style={{
          position: 'absolute', left: hl, top: ht, width: hw,
          fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500, fontSize: size,
          color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
          whiteSpace: 'pre-wrap',
        }}>{headline}</div>
        <RowStack top={firstRowTop} rows={rows} />
      </>
    )
  }

  function RowStack({ top, rows }: { top: number; rows: { text?: string; l: number; w?: number }[][] }) {
    const refs = useRef<(HTMLDivElement | null)[]>([])
    const flatItems = rows.flat()
    const [heights, setHeights] = useState<number[]>(() => flatItems.map(() => 0))

    useLayoutEffect(() => {
      const update = () => setHeights(refs.current.map(el => el?.offsetHeight ?? 0))
      update()
      const observers = refs.current.map(el => {
        if (!el) return undefined
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return ro
      })
      return () => observers.forEach(ro => ro?.disconnect())
    }, [flatItems.map(it => it.text).join(' ')])

    const elements: React.ReactNode[] = []
    let cursor = top
    let flatIdx = 0
    rows.forEach(row => {
      const rowTop = cursor
      const startIdx = flatIdx
      row.forEach(item => {
        const idx = flatIdx
        elements.push(
          <div
            key={idx}
            ref={el => { refs.current[idx] = el }}
            style={{
              position: 'absolute', left: item.l, top: rowTop, width: item.w ?? 220,
              fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 14,
              color: '#505050', textAlign: 'justify', lineHeight: 'normal',
              whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
            }}
          >{renderInlineMarkdown(item.text || '')}</div>
        )
        flatIdx++
      })
      const rowHeights = heights.slice(startIdx, flatIdx)
      const maxH = rowHeights.length ? Math.max(...rowHeights) : 0
      cursor = rowTop + maxH + HEADING_BODY_GAP
    })

    return <>{elements}</>
  }

  function H2({ children, l, t, w = 421, size = 22 }: { children?: string; l: number; t: number; w?: number; size?: number }) {
    if (!children) return null
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500, fontSize: size,
        color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
        whiteSpace: 'pre-wrap',
      }}>{children}</div>
    )
  }

  function P({ children, l, t, w = 220, size = 14 }: { children?: string; l: number; t: number; w?: number; size?: number }) {
    if (!children) return null
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: size,
        color: '#505050', textAlign: 'justify', lineHeight: 'normal',
        whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
      }}>{renderInlineMarkdown(children)}</div>
    )
  }

  return (
    <>
      <div
        ref={wrapperRef}
        style={{ width: '100%', height: canvasH * scale, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{
          width: W, height: canvasH, position: 'relative', background: '#fff',
          transform: `scale(${scale})`, transformOrigin: 'top left',
          fontFamily: 'var(--font-sans, Montserrat)',
        }}>

          <CanvasHeader
            W={W}
            titleBold={data.titleBold}
            heroImage={data.heroImage}
            heroImageAdjust={rawData.heroImageAdjust}
            location={data.location}
            coordinates={data.coordinates}
            camera={data.camera}
            viewMode={viewMode}
            setViewMode={setViewMode}
            stickyNav={stickyNav}
            isEditing={isEditing}
            onImageSelect={onImageSelect}
            cloudName={cloudName}
          />

          {viewMode === 'story' && (
            <>
              {activeSections.map((s, i) => {
                const off = sectionOffset(i)
                const num = String(i + 1).padStart(2, '0')
                const sk = String(i)
                const pat = i % 7
                switch (pat) {
                  case 0: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={250} t={1009 + off} w={590} h={540} adj={s.image1Adjust} />
                      <SecNum n={num} l={1400} t={1009 + off} />
                      <HeadingRow headline={s.headline} hl={880} ht={1050 + off} hw={550} rows={[
                        [{ text: s.quote, l: 880, w: 550 }],
                        [{ text: s.body1, l: 880, w: 260 }, { text: s.body2, l: 1170, w: 260 }],
                        [{ text: s.body3, l: 880, w: 550 }],
                      ]} />
                    </React.Fragment>
                  )
                  case 1: return (
                    <React.Fragment key={i}>
                      <SecNum n={num} l={770} t={1720 + off} />
                      <ImgBox id={s.image1} si={sk} field="image1" l={820} t={1640 + off} w={560} h={480} adj={s.image1Adjust} />
                      <HeadingRow headline={s.headline} hl={254} ht={1760 + off} hw={450} rows={[[{ text: s.body1, l: 254 }, { text: s.body2, l: 503 }]]} />
                    </React.Fragment>
                  )
                  case 2: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={254} t={2773 + off} w={1126} h={500} adj={s.image1Adjust} />
                      <SecNum n={num} l={1350} t={3320 + off} />
                      <HeadingRow headline={s.headline} hl={810} ht={3360 + off} hw={500} rows={[[{ text: s.body1, l: 810 }, { text: s.body2, l: 1060 }]]} />
                    </React.Fragment>
                  )
                  case 3: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={254} t={3387 + off} w={520} h={620} adj={s.image1Adjust} />
                      <SecNum n={num} l={1350} t={3800 + off} />
                      <HeadingRow headline={s.headline} hl={810} ht={3840 + off} hw={500} rows={[
                        [{ text: s.quote, l: 810, w: 458 }],
                        [{ text: s.body1, l: 810, w: 220 }, { text: s.body2, l: 1060, w: 220 }],
                      ]} />
                    </React.Fragment>
                  )
                  case 4: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image2} si={sk} field="image2" l={620} t={4042 + off} w={760} h={480} adj={s.image2Adjust} />
                      <SecNum n={num} l={500} t={4150 + off} />
                      <HeadingRow headline={s.headline} hl={260} ht={4190 + off} hw={340} rows={[
                        [{ text: s.quote, l: 260, w: 340 }],
                        [{ text: s.body3, l: 260, w: 220 }],
                      ]} />
                      <P l={510} t={4550 + off} w={220}>{s.body4}</P>
                    </React.Fragment>
                  )
                  case 5: return (
                    <React.Fragment key={i}>
                      <ImgBox id={s.image1} si={sk} field="image1" l={254} t={4687 + off} w={620} h={480} adj={s.image1Adjust} />
                      <SecNum n={num} l={1350} t={4800 + off} />
                      <H2 l={910} t={4840 + off} w={460}>{s.headline}</H2>
                      <P l={910} t={4970 + off} w={460}>{s.quote}</P>
                      <P l={254} t={5220 + off} w={220}>{s.body2}</P>
                      <P l={504} t={5220 + off} w={220}>{s.body3}</P>
                      <P l={754} t={5220 + off} w={220}>{s.body4}</P>
                    </React.Fragment>
                  )
                  case 6: return (
                    <React.Fragment key={i}>
                      <SecNum n={num} l={700} t={5341 + off} />
                      <ImgBox id={s.image1} si={sk} field="image1" l={780} t={5341 + off} w={600} h={450} adj={s.image1Adjust} />
                      <HeadingRow headline={s.headline} hl={254} ht={5380 + off} hw={500} rows={[[{ text: s.body1, l: 254 }, { text: s.body2, l: 504 }]]} />
                    </React.Fragment>
                  )
                  default: return null
                }
              })}

            </>
          )}

        </div>
      </div>

      {viewMode === 'story' && (
        <>
          {Array.isArray(data.podcastSpotifyUrls) && data.podcastSpotifyUrls.length > 0 && (
            <PodcastSection urls={data.podcastSpotifyUrls} scale={scale} />
          )}
          <CanvasFooter
            nextProjectSlug={data.nextProjectSlug}
            destinations={(rawData as Record<string, unknown>).destinations as { slug: string }[] ?? []}
            scale={scale}
          />
        </>
      )}

      {viewMode === 'photos' && (
        <CanvasPhotosView imageIds={allImageIds} nextProject={data.nextProjectSlug ? { slug: data.nextProjectSlug, title: '' } : null} destinations={(rawData as Record<string, unknown>).destinations as { slug: string }[] ?? []} />
      )}

      {/* ━━ SIDEBAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {!isEditing && stickyNav && (
        <StickyViewNav viewMode={viewMode} onViewMode={setViewMode} />
      )}

      {!isEditing && viewMode === 'story' && (
        <CanvasSidebar
          visible={sidebarVisible}
          activeIdx={activeIdx}
          sections={sidebarSections}
          scale={scale}
          onScrollTo={handleScrollTo}
        />
      )}
    </>
  )
}

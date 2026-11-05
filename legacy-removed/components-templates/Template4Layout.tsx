'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { hasContent, type ImageAdjust, type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasHeader from './CanvasHeader'
import CanvasSidebar from './CanvasSidebar'
import CanvasPhotosView from './CanvasPhotosView'
import PodcastSection from './PodcastSection'
import StickyViewNav from './StickyViewNav'
export type Template4Data = TemplateData

const FIELD_MAPS: Record<string, string>[] = [
  { image1: 'sec1Image', headline: 'sec1Headline', body1: 'sec1Body1', body2: 'sec1Body2' },
  { image1: 'sec2Image', image2: 'sec2ImageB', image3: 'sec2ImageC', headline: 'sec2Headline', body1: 'sec2Body1', body2: 'sec2Body2', body3: 'sec2Body3' },
  { image1: 'sec3Image', image2: 'sec3ImageB', headline: 'sec3Headline', body1: 'sec3Body1', body3: 'sec3Body3', body5: 'sec3Body5' },
  { image1: 'sec4ImageTall', image2: 'sec4Image', image3: 'sec4ImageC', headline: 'sec4Headline', body1: 'sec4Body1', body2: 'sec4Body2', body3: 'sec4Body3' },
  { image1: 'sec5Image', image2: 'sec5ImageB', headline: 'sec5Headline', body1: 'sec5Body1', body2: 'sec5Body2' },
  { image1: 'sec6Image', image2: 'sec6ImageB', headline: 'sec6Headline', body1: 'sec6Body1', body2: 'sec6Body2' },
  { image1: 'sec7Image', headline: 'sec7Headline', body1: 'sec7Body1', body2: 'sec7Body2' },
  { image1: 'sec9Image', image2: 'sec9ImageB', image3: 'sec9ImageC', headline: 'sec9Headline', body1: 'sec9Body1', body2: 'sec9Body2', body3: 'sec9Body3', body4: 'sec9Body4' },
  { image1: 'sec10Image', image2: 'sec10ImageB', headline: 'sec10Headline', body1: 'sec10Body1', body2: 'sec10Body2', body3: 'sec10Body3' },
  { image1: 'sec11Image', image2: 'sec11ImageB', headline: 'sec11Headline', body1: 'sec11Body1', body2: 'sec11Body2' },
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

// ─── Canvas constants ─────────────────────────────────────────────────────────

const W = 1504

// Y where each pattern's topmost element begins
const SECTION_STARTS = [1009, 1676, 2556, 3797, 5478, 6277, 6749, 8500, 9800, 10800]

// Vertical slot height of each pattern
const SECTION_HEIGHTS = [667, 801, 814, 873, 832, 823, 500, 1000, 900, 850]

// Where content starts — shifted up 50px from the original 1009 to tighten
// the whitespace between the header and the title/hero
const CONTENT_TOP = 959

// Bottom of the deepest element in each pattern at offset=0
const SECTION_CONTENT_BOTTOMS = [1566, 2477, 3270, 4670, 6280, 7030, 7129, 9760, 10600, 11650]


// ─── Component ────────────────────────────────────────────────────────────────

export default function Template4Layout({
  data: rawData,
  isEditing = false,
  onImageSelect,
}: {
  data: Partial<Template4Data>
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
    const pat = i % 10
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 10]
    return (CONTENT_TOP + cumH) - SECTION_STARTS[pat]
  }

  const lastIdx = activeSections.length - 1
  const lastContentBottom = lastIdx >= 0
    ? SECTION_CONTENT_BOTTOMS[lastIdx % 10] + sectionOffset(lastIdx)
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
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 10]
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
        for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 10]
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
              {!url && '+ Image'}
              {url && <span style={{ opacity: 0 }}>Change</span>}
            </div>
          )}
        </div>
        {isEditing && url && (
          <span style={{
            position: 'absolute', left: l + w - 38, top: t + 6,
            background: 'rgba(255,255,255,0.85)', borderRadius: 4, padding: '2px 6px',
            fontSize: 10, cursor: 'pointer', color: '#333', zIndex: 2,
          }} onClick={() => onImageSelect?.(si, field)}>Change</span>
        )}
      </>
    )
  }

  function SecNum({ n, l, t }: { n: string; l: number; t: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400, fontSize: 22,
        color: '#ccc', lineHeight: 'normal',
      }}>{n}</div>
    )
  }

  // Standardized gap from the bottom of the heading's last rendered line to
  // the body text. Headline line count depends on how the text actually
  // wraps at render width, so the body position is measured off the
  // heading's real rendered height rather than a fixed offset.
  const HEADING_BODY_GAP = 10

  function HeadingRow({ headline, hl, ht, hw = 421, bodies }: {
    headline?: string; hl: number; ht: number; hw?: number
    bodies: { text?: string; l: number; w?: number }[]
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

    const bodyTop = ht + headingHeight + HEADING_BODY_GAP

    return (
      <>
        <div ref={ref} style={{
          position: 'absolute', left: hl, top: ht, width: hw,
          fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500, fontSize: 22,
          color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
          whiteSpace: 'pre-wrap',
        }}>{headline}</div>
        {bodies.map((b, idx) => (
          <P key={idx} l={b.l} t={bodyTop} w={b.w}>{b.text}</P>
        ))}
      </>
    )
  }

  function P({ children, l, t, w = 220 }: { children?: string; l: number; t: number; w?: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t, width: w,
        fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400,
        fontSize: 14, color: '#505050', textAlign: 'justify', lineHeight: 'normal',
        whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
      }}>{renderInlineMarkdown(children || '')}</div>
    )
  }

  function Quote({ children, l, t, w = 220 }: { children?: string; l: number; t: number; w?: number }) {
    if (!children) return null
    return (
      <div style={{ position: 'absolute', left: l, top: t, width: w }}>
        <svg width="30" height="26" viewBox="0 0 29.773 25.235" style={{ display: 'block', marginBottom: 8 }}>
          <path d="M0 25.235h12.95L19.427 0H6.477L0 25.235zm16.824 0H29.773L29.773 0H16.824L16.824 25.235z" fill="#1c1c1c" />
        </svg>
        <div style={{
          fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 14,
          color: '#505050', lineHeight: 'normal', textAlign: 'justify',
        }}>{children}</div>
      </div>
    )
  }

  // ─── Render sections ────────────────────────────────────────────────────────

  function renderSection(s: Section, i: number) {
    const off = sectionOffset(i)
    const num = String(i + 1).padStart(2, '0')
    const sk = String(i)
    const pat = i % 10

    switch (pat) {
      case 0: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={1012 + off} w={691} h={554} adj={s.image1Adjust} />
          <SecNum n={num} l={1332} t={1009 + off} />
          <HeadingRow headline={s.headline} hl={964} ht={1239 + off} hw={399} bodies={[{ text: s.body1, l: 964 }, { text: s.body2, l: 1212 }]} />
        </React.Fragment>
      )
      case 1: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={252} t={1676 + off} w={463} h={454} adj={s.image1Adjust} />
          <SecNum n={num} l={1320} t={1676 + off} />
          <HeadingRow headline={s.headline} hl={730} ht={1740 + off} hw={466} bodies={[{ text: s.body1, l: 730, w: 300 }, { text: s.body2, l: 1050, w: 300 }]} />
          <ImgBox id={s.image3} si={sk} field="image3" l={1213} t={2025 + off} w={223} h={115} adj={s.image3Adjust} />
          <ImgBox id={s.image2} si={sk} field="image2" l={733} t={2160 + off} w={462} h={317} adj={s.image2Adjust} />
          <P l={1213} t={2170 + off} w={223}>{s.body3}</P>
        </React.Fragment>
      )
      case 2: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={2556 + off} w={331} h={671} adj={s.image1Adjust} />
          <SecNum n={num} l={1051} t={2567 + off} />
          <HeadingRow headline={s.headline} hl={621} ht={2617 + off} hw={453} bodies={[{ text: s.body1, l: 621, w: 224 }, { text: s.body3, l: 862, w: 224 }]} />
          <ImgBox id={s.image2} si={sk} field="image2" l={1140} t={2758 + off} w={250} h={300} adj={s.image2Adjust} />
          <P l={1140} t={3070 + off} w={250}>{s.body5}</P>
        </React.Fragment>
      )
      case 3: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={3797 + off} w={400} h={380} adj={s.image1Adjust} />
          <SecNum n={num} l={1100} t={3797 + off} />
          <HeadingRow headline={s.headline} hl={700} ht={3840 + off} hw={480} bodies={[{ text: s.body1, l: 700 }, { text: s.body2, l: 950 }]} />
          <ImgBox id={s.image2} si={sk} field="image2" l={960} t={4200 + off} w={300} h={200} adj={s.image2Adjust} />
          <ImgBox id={s.image3} si={sk} field="image3" l={254} t={4280 + off} w={420} h={200} adj={s.image3Adjust} />
          <P l={960} t={4420 + off} w={250}>{s.body3}</P>
        </React.Fragment>
      )
      case 4: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={5478 + off} w={300} h={550} adj={s.image1Adjust} />
          <SecNum n={num} l={1020} t={5520 + off} />
          <HeadingRow headline={s.headline} hl={580} ht={5520 + off} hw={400} bodies={[{ text: s.body1, l: 580 }, { text: s.body2, l: 820 }]} />
          <ImgBox id={s.image2} si={sk} field="image2" l={1100} t={5780 + off} w={280} h={500} adj={s.image2Adjust} />
        </React.Fragment>
      )
      case 5: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={6277 + off} w={450} h={400} adj={s.image1Adjust} />
          <SecNum n={num} l={1200} t={6277 + off} />
          <HeadingRow headline={s.headline} hl={740} ht={6320 + off} hw={500} bodies={[{ text: s.body1, l: 740 }, { text: s.body2, l: 990 }]} />
          <ImgBox id={s.image2} si={sk} field="image2" l={740} t={6750 + off} w={500} h={280} adj={s.image2Adjust} />
        </React.Fragment>
      )
      case 6: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={6749 + off} w={530} h={380} adj={s.image1Adjust} />
          <SecNum n={num} l={1200} t={6749 + off} />
          <HeadingRow headline={s.headline} hl={820} ht={6790 + off} hw={500} bodies={[{ text: s.body1, l: 820 }, { text: s.body2, l: 1070 }]} />
        </React.Fragment>
      )
      case 7: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={650} t={8500 + off} w={730} h={380} adj={s.image1Adjust} />
          <SecNum n={num} l={560} t={8510 + off} />
          <HeadingRow headline={s.headline} hl={254} ht={8550 + off} hw={380} bodies={[{ text: s.body1, l: 254, w: 180 }, { text: s.body2, l: 460, w: 180 }]} />
          <ImgBox id={s.image2} si={sk} field="image2" l={254} t={8950 + off} w={200} h={300} adj={s.image2Adjust} />
          <P l={480} t={8960 + off} w={200}>{s.body3}</P>
          <ImgBox id={s.image3} si={sk} field="image3" l={680} t={9100 + off} w={460} h={260} adj={s.image3Adjust} />
          <P l={1180} t={9110 + off} w={200}>{s.body4}</P>
        </React.Fragment>
      )
      case 8: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={9800 + off} w={400} h={500} adj={s.image1Adjust} />
          <SecNum n={num} l={1200} t={9800 + off} />
          <HeadingRow headline={s.headline} hl={690} ht={9840 + off} hw={500} bodies={[{ text: s.body1, l: 690 }, { text: s.body2, l: 940 }]} />
          <ImgBox id={s.image2} si={sk} field="image2" l={820} t={10350 + off} w={300} h={250} adj={s.image2Adjust} />
          <P l={1140} t={10350 + off} w={200}>{s.body3}</P>
        </React.Fragment>
      )
      case 9: return (
        <React.Fragment key={i}>
          <ImgBox id={s.image1} si={sk} field="image1" l={254} t={10800 + off} w={400} h={550} adj={s.image1Adjust} />
          <SecNum n={num} l={1200} t={10800 + off} />
          <HeadingRow headline={s.headline} hl={690} ht={10840 + off} hw={550} bodies={[{ text: s.body1, l: 690 }, { text: s.body2, l: 940 }]} />
          <ImgBox id={s.image2} si={sk} field="image2" l={800} t={11350 + off} w={500} h={300} adj={s.image2Adjust} />
        </React.Fragment>
      )
      default: return null
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div ref={wrapperRef} style={{ width: '100%', height: canvasH * scale, position: 'relative', overflow: 'hidden' }}>
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

          {/* ━━ STORY CONTENT */}
          {viewMode === 'story' && activeSections.map((s, i) => renderSection(s, i))}

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
        <CanvasPhotosView
          imageIds={allImageIds}
          nextProject={data.nextProjectSlug ? { slug: data.nextProjectSlug, title: '' } : null}
          destinations={(rawData as Record<string, unknown>).destinations as { slug: string }[] ?? []}
        />
      )}

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

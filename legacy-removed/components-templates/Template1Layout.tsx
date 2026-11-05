'use client'

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { hasContent, type ImageAdjust, type Section, type TemplateData } from '@/components/admin/template-editor/shared'
import { renderInlineMarkdown } from '@/lib/utils/inline-markdown'
import CanvasFooter from './CanvasFooter'
import CanvasHeader from './CanvasHeader'
import CanvasSidebar from './CanvasSidebar'
import CanvasPhotosView from './CanvasPhotosView'
import PodcastSection from './PodcastSection'
import StickyViewNav from './StickyViewNav'

export type T1Section = Section
export type Template1Data = TemplateData

// ─── Canvas constants ─────────────────────────────────────────────────────────

const W = 1512

// Y where each pattern's topmost element begins (absolute in the original 8900px canvas)
const SECTION_STARTS = [1012, 1587, 2702, 3280, 3923, 4548, 5193, 6038, 6471, 7152, 7823]

// Vertical slot height of each pattern (start[i+1] - start[i]; last pattern ends at footer y=8357)
const SECTION_HEIGHTS = [575, 1100, 583, 643, 625, 630, 845, 433, 681, 631, 534]

// Where content starts (top of first pattern's slot) — shifted up 50px from the
// original 1012 to tighten the whitespace between the header and the title/hero
const CONTENT_TOP = 962

// Bottom of the deepest element (image + caption, or text) in each pattern at offset=0
// Used to place the footer below the actual last element, not just the slot boundary
const SECTION_CONTENT_BOTTOMS = [1560, 2650, 3250, 3860, 4520, 5527, 6030, 6410, 7070, 7740, 8320]


// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  data: Partial<Template1Data>
  isEditing?: boolean
  onImageSelect?: (sectionIndex: string, field: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Template1Layout({ data, isEditing, onImageSelect }: Props) {
  const [scale, setScale] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'story' | 'photos'>('story')
  const [stickyNav, setStickyNav] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const el = wrapperRef.current
      if (!el) return
      const avail = el.parentElement?.clientWidth ?? window.innerWidth
      setScale(avail / W)
    }
    update()
    const ro = new ResizeObserver(update)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  // Normalize: support legacy s01-s11 keys from old data saved before this refactor
  const rawData = data as Partial<Template1Data> & Record<string, unknown>
  const sections: T1Section[] = rawData.sections
    ?? (['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11'] as const)
        .map(k => rawData[k] as T1Section | undefined)
        .filter((s): s is T1Section => !!s)

  // In public mode only render sections that have content
  const activeSections = isEditing
    ? sections
    : sections.filter(s => hasContent(s))

  // Cumulative Y offset per section index
  function sectionOffset(i: number): number {
    const pat = i % 11
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 11]
    return (CONTENT_TOP + cumH) - SECTION_STARTS[pat]
  }

  const lastIdx = activeSections.length - 1
  const lastContentBottom = lastIdx >= 0
    ? SECTION_CONTENT_BOTTOMS[lastIdx % 11] + sectionOffset(lastIdx)
    : CONTENT_TOP
  const allImageIds = activeSections.flatMap(s =>
    [s.image1, s.image2, s.image3, s.image4].filter((id): id is string => !!id)
  )

  const HEADER_END = 946
  const storyFooterY = lastContentBottom + 60
  const storyCanvasH = storyFooterY
  const canvasH = viewMode === 'photos' ? HEADER_END : storyCanvasH

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

  const sidebarSections = activeSections.map((s, i) => {
    let cumH = 0
    for (let j = 0; j < i; j++) cumH += SECTION_HEIGHTS[j % 11]
    return { scrollY: CONTENT_TOP + cumH, headline: s.headline }
  })

  // Track which section is in the viewport (public mode only)
  useEffect(() => {
    if (isEditing || activeSections.length === 0) return
    const onScroll = () => {
      const el = wrapperRef.current
      if (!el) return
      const canvasTop = el.getBoundingClientRect().top
      const pivotY = (window.innerHeight * 0.4 - canvasTop) / scale

      // Footer start: deepest content of last section + gap
      const lastI = activeSections.length - 1
      let cumOff = 0
      for (let j = 0; j < lastI; j++) cumOff += SECTION_HEIGHTS[j % 11]
      const fY = lastI >= 0
        ? SECTION_CONTENT_BOTTOMS[lastI % 11] + ((CONTENT_TOP + cumOff) - SECTION_STARTS[lastI % 11]) + 60
        : CONTENT_TOP

      // Sidebar only visible while pivot is inside the sections zone
      setSidebarVisible(pivotY >= CONTENT_TOP && pivotY <= fY)

      let active = 0
      let cumH2 = 0
      for (let i = 0; i < activeSections.length; i++) {
        if (CONTENT_TOP + cumH2 <= pivotY) active = i
        cumH2 += SECTION_HEIGHTS[i % 11]
      }
      setActiveIdx(active)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [activeSections.length, scale, isEditing])

  const d = data
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const imgUrl = (id?: string) =>
    id && cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/${id}` : ''

  // ─── Sub-components ───────────────────────────────────────────────────────

  function ImgBox({ id, sk, field, l, t, w, h, cap, adj }: {
    id?: string; sk: string; field: string
    l: number; t: number; w: number; h: number
    cap?: string; adj?: ImageAdjust
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
          onClick={isEditing ? () => onImageSelect?.(sk, field) : undefined}
        >
          {url && <img src={url} alt={cap || ''} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: `${x}% ${y}%`, transform: zoom !== 1 ? `scale(${zoom})` : undefined, transformOrigin: `${x}% ${y}%`, display: 'block' }} />}
          {isEditing && (
            <div
              style={{
                position: 'absolute', inset: 0,
                background: url ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#888', fontFamily: 'var(--font-sans, Montserrat)',
                transition: 'background 0.15s',
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
            fontSize: 14, color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
          }}>
            {cap}
          </div>
        )}
      </>
    )
  }

  function Num({ n, l, t }: { n: string; l: number; t: number }) {
    return (
      <div style={{
        position: 'absolute', left: l, top: t,
        fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 400,
        fontSize: 28, color: '#ccc', lineHeight: 'normal',
      }}>{n}</div>
    )
  }

  // Standardized gap from the bottom of the heading's last rendered line to
  // the body text (was inconsistent per pattern, 69-141px).
  const HEADING_BODY_GAP = 10

  // Headline line count depends on how the text actually wraps at render
  // width (e.g. a one-line field value can wrap to 2-3 lines on screen), so
  // the body position is measured off the heading's real rendered height
  // rather than a fixed offset.
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
          fontFamily: 'var(--font-serif, DM Sans)', fontWeight: 500,
          fontSize: 22, color: '#1c1c1c', textTransform: 'uppercase', lineHeight: 'normal',
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

  // ─── Section renderer — pattern cycles every 11 ──────────────────────────

  function renderSection(s: T1Section, i: number) {
    const pat = i % 11
    const off = sectionOffset(i)
    const num = String(i + 1).padStart(2, '0')
    const sk = String(i)

    switch (pat) {
      case 0: return (
        <React.Fragment key={i}>
          <Num n={num} l={1404} t={1203 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={254} t={1012 + off} w={691} h={520} adj={s.image1Adjust} />
          <HeadingRow headline={s.headline} hl={964} ht={1239 + off} hw={399} bodies={[{ text: s.body1, l: 964 }, { text: s.body2, l: 1212 }]} />
        </React.Fragment>
      )
      case 1: return (
        <React.Fragment key={i}>
          <Num n={num} l={923} t={1587 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={253} t={1604 + off} w={469} h={311} adj={s.image1Adjust} />
          <ImgBox id={s.image2} sk={sk} field="image2" l={996} t={1916 + off} w={193} h={354} adj={s.image2Adjust} />
          <P l={1212} t={1916 + off}>{s.body3}</P>
          <ImgBox id={s.image3} sk={sk} field="image3" l={254} t={2062 + off} w={494} h={575} adj={s.image3Adjust} />
          <P l={766} t={2380 + off}>{s.body2}</P>
          <ImgBox id={s.image4} sk={sk} field="image4" l={996} t={2283 + off} w={193} h={354} adj={s.image4Adjust} />
          <HeadingRow headline={s.headline} hl={738} ht={1651 + off} bodies={[{ text: s.body1, l: 738 }]} />
        </React.Fragment>
      )
      case 2: return (
        <React.Fragment key={i}>
          <Num n={num} l={686} t={2898 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={748} t={2702 + off} w={684} h={520} adj={s.image1Adjust} />
          <HeadingRow headline={s.headline} hl={254} ht={2953 + off} hw={421} bodies={[{ text: s.body1, l: 254 }, { text: s.body2, l: 503 }]} />
        </React.Fragment>
      )
      case 3: return (
        <React.Fragment key={i}>
          <Num n={num} l={1014} t={3416 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={248} t={3280 + off} w={499} h={554} adj={s.image1Adjust} />
          <HeadingRow headline={s.headline} hl={766} ht={3434 + off} hw={248} bodies={[{ text: s.body1, l: 766 }, { text: s.body2, l: 1005 }]} />
        </React.Fragment>
      )
      case 4: return (
        <React.Fragment key={i}>
          <Num n={num} l={756} t={3923 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={254} t={3923 + off} w={478} h={575} adj={s.image1Adjust} />
          <ImgBox id={s.image2} sk={sk} field="image2" l={1006} t={4043 + off} w={193} h={354} adj={s.image2Adjust} />
          <HeadingRow headline={s.headline} hl={756} ht={3975 + off} hw={220} bodies={[{ text: s.body1, l: 756, w: 220 }]} />
          <P l={1211} t={4260 + off}>{s.body2}</P>
        </React.Fragment>
      )
      case 5: return (
        <React.Fragment key={i}>
          <Num n={num} l={685} t={4732 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={732} t={4548 + off} w={694} h={589} adj={s.image1Adjust} />
          <HeadingRow headline={s.headline} hl={254} ht={4775 + off} hw={421} bodies={[{ text: s.body1, l: 254 }, { text: s.body2, l: 493 }]} />
          <ImgBox id={s.image2} sk={sk} field="image2" l={253} t={5193 + off} w={469} h={334} adj={s.image2Adjust} />
          <P l={750} t={5193 + off} w={220}>{s.body3}</P>
        </React.Fragment>
      )
      case 6: return (
        <React.Fragment key={i}>
          <Num n={num} l={1070} t={5578 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={1133} t={5569 + off} w={293} h={456} adj={s.image1Adjust} />
          <ImgBox id={s.image2} sk={sk} field="image2" l={253} t={5847 + off} w={469} h={178} adj={s.image2Adjust} />
          <HeadingRow headline={s.headline} hl={883} ht={5626 + off} hw={220} bodies={[{ text: s.body1, l: 883 }]} />
        </React.Fragment>
      )
      case 7: return (
        <React.Fragment key={i}>
          <Num n={num} l={686} t={6038 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={1133} t={6117 + off} w={293} h={262} adj={s.image1Adjust} />
          <HeadingRow headline={s.headline} hl={254} ht={6081 + off} hw={467} bodies={[{ text: s.body1, l: 254 }, { text: s.body2, l: 493 }]} />
        </React.Fragment>
      )
      case 8: return (
        <React.Fragment key={i}>
          <Num n={num} l={1388} t={6490 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={254} t={6471 + off} w={688} h={589} adj={s.image1Adjust} />
          <HeadingRow headline={s.headline} hl={957} ht={6533 + off} hw={421} bodies={[{ text: s.body1, l: 957 }, { text: s.body2, l: 1196 }]} />
        </React.Fragment>
      )
      case 9: return (
        <React.Fragment key={i}>
          <Num n={num} l={1229} t={7152 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={254} t={7152 + off} w={484} h={575} adj={s.image1Adjust} />
          <HeadingRow headline={s.headline} hl={754} ht={7210 + off} hw={504} bodies={[{ text: s.body1, l: 754 }, { text: s.body2, l: 998 }]} />
        </React.Fragment>
      )
      case 10: return (
        <React.Fragment key={i}>
          <Num n={num} l={1233} t={7830 + off} />
          <ImgBox id={s.image1} sk={sk} field="image1" l={512} t={7823 + off} w={227} h={487} adj={s.image1Adjust} />
          <HeadingRow headline={s.headline} hl={787} ht={7895 + off} bodies={[{ text: s.body1, l: 787 }, { text: s.body2, l: 1031 }]} />
        </React.Fragment>
      )
      default: return null
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: canvasH * scale, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        width: W, height: canvasH,
        position: 'relative', background: '#fff',
        transform: `scale(${scale})`, transformOrigin: 'top left',
        fontFamily: 'var(--font-sans, Montserrat)',
      }}>

        <CanvasHeader
          W={W}
          titleBold={d?.titleBold}
          heroImage={d?.heroImage}
          heroImageAdjust={d?.heroImageAdjust}
          location={d?.location}
          coordinates={d?.coordinates}
          camera={d?.camera}
          viewMode={viewMode}
          setViewMode={setViewMode}
          stickyNav={stickyNav}
          isEditing={isEditing}
          onImageSelect={onImageSelect}
          cloudName={cloudName}
        />

        {/* ━━━ STORY CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {viewMode === 'story' && activeSections.map((s, i) => renderSection(s, i))}

      </div>
    </div>

    {viewMode === 'story' && (
      <>
        {Array.isArray(d?.podcastSpotifyUrls) && d!.podcastSpotifyUrls!.length > 0 && (
          <PodcastSection urls={d!.podcastSpotifyUrls!} scale={scale} />
        )}
        <CanvasFooter
          nextProjectSlug={d?.nextProjectSlug}
          destinations={(d as Record<string, unknown>)?.destinations as { slug: string }[] ?? []}
          scale={scale}
        />
      </>
    )}

    {viewMode === 'photos' && (
      <CanvasPhotosView imageIds={allImageIds} nextProject={d?.nextProjectSlug ? { slug: d.nextProjectSlug, title: '' } : null} destinations={(d as Record<string, unknown>)?.destinations as { slug: string }[] ?? []} />
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

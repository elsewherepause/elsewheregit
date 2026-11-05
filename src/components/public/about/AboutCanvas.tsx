'use client'

import { useState, useRef, useEffect } from 'react'
import ContactForm from './ContactForm'
import FooterBase from '@/components/public/FooterBase'

const W = 1512
const H = 6471

const mont: React.CSSProperties = { fontFamily: 'Montserrat, sans-serif' }
const dm: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }

export default function AboutCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const check = () => {
      const w = el.clientWidth
      setScale(w / W)
      setIsMobile(w < 768)
    }
    check()
    const ro = new ResizeObserver(() => check())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (isMobile) {
    return (
      <div ref={wrapperRef} style={{ width: '100%' }}>
        <MobileLayout />
      </div>
    )
  }

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: H * scale, position: 'relative' }}>
      <div style={{
        width: W, height: H,
        position: 'relative',
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        background: '#fff',
        overflow: 'hidden',
      }}>

        {/* ── Name heading ── */}
        <p style={{ position: 'absolute', left: 80, top: 87, fontSize: 75.891, color: '#000', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 'normal', margin: 0, ...mont }}>
          <span style={{ fontWeight: 700 }}>Arjun </span>
          <span style={{ fontWeight: 400 }}>Swaminathan</span>
        </p>

        {/* ── Intro paragraph ── */}
        <p style={{ position: 'absolute', left: 984, top: 220, width: 448, color: '#505050', fontSize: 16, fontWeight: 400, textAlign: 'justify', lineHeight: '1.6', margin: 0, ...mont }}>
          I work where movement, culture, and human experience meet. I go slowly, and I stay long enough for a place to reveal what it is.
        </p>

        {/* ── Large portrait ── */}
        <div style={{ position: 'absolute', height: 675, left: 80, top: 315, width: 589, overflow: 'hidden' }}>
          <img alt="Arjun portrait" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/arjun-portrait.png" />
        </div>

        {/* ── Moto photo ── */}
        <div style={{ position: 'absolute', height: 326, left: 1216, top: 315, width: 216, overflow: 'hidden' }}>
          <img alt="" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/arjun-moto.png" />
        </div>

        {/* ── Bio text 1 ── */}
        <p style={{ position: 'absolute', left: 730, top: 706, width: 502, color: '#505050', fontSize: 16, fontWeight: 400, textAlign: 'justify', lineHeight: '1.6', margin: 0, ...mont }}>
          {`For two decades, I have used photography, film, sound, and writing to follow people whose lives are tied to land, craft, and the quiet rituals that hold things together. People in India’s hinterlands, and beyond. People whose knowledge lives in their hands, in the engines they fix, in the dust of the road, and in the weave of a fabric.`}
        </p>

        {/* ── Arjun sitting image ── */}
        <div style={{ position: 'absolute', height: 579, left: 80, top: 1150, width: 453, overflow: 'hidden' }}>
          <img alt="" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/arjun-sitting.png" />
        </div>

        {/* ── Bio text 2 ── */}
        <p style={{ position: 'absolute', left: 613, top: 1350, width: 285, color: '#505050', fontSize: 16, fontWeight: 400, textAlign: 'justify', lineHeight: '1.6', margin: 0, ...mont }}>
          {`I am drawn to stories of risk, repair, and survival, the kind that rarely travel far from where they were made. Stories that live in local governance, biodiversity, and oral traditions passed between generations, often in languages that were never written down. Wherever I go, I am humbled by the trust people place in me, to listen carefully and to carry what I hear with care.`}
        </p>

        {/* ── River scene image ── */}
        <div style={{ position: 'absolute', height: 249, left: 984, top: 1150, width: 448, overflow: 'hidden' }}>
          <img alt="" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/river-scene.png" />
        </div>

        {/* ── Quote block ── */}
        <div style={{ position: 'absolute', left: 533, top: 1850, width: 899, display: 'flex', flexDirection: 'column', gap: 35 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 28.372, width: 32.616, flexShrink: 0 }}>
              <img alt="" style={{ display: 'block', width: '100%', height: '100%' }} src="/icons/open-quote.svg" />
            </div>
            <p style={{ fontWeight: 500, fontStyle: 'italic', fontSize: 32, color: '#000', textTransform: 'uppercase', lineHeight: '1.3', margin: 0, ...dm }}>
              {`My heart rests somewhere between a slab of cold stone and a hot cup of tea, listening to a story of how one spell of hard rain changed the course of three generations, or how a root, a leaf, and a mushroom once saved a man's life.`}
            </p>
          </div>
          <p style={{ fontWeight: 400, fontSize: 16, color: '#505050', lineHeight: 'normal', margin: 0, ...mont }}>
            That, to me, is home.
          </p>
        </div>

        {/* ── Elsewhere section ── */}
        <div style={{ position: 'absolute', left: 80, top: 2300, width: 373, color: '#505050', fontSize: 16 }}>
          <p style={{ fontWeight: 700, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, ...mont }}>Elsewhere</p>
          <p style={{ fontWeight: 400, lineHeight: 1.6, textAlign: 'justify', margin: 0, ...mont }}>
            Elsewhere began as a question: what happens when you stay somewhere long enough for it to stop performing for you?
          </p>
          <br />
          <p style={{ fontWeight: 400, lineHeight: 1.6, textAlign: 'justify', margin: 0, ...mont }}>
            The real stories are never in the headline moment. They live in the margins, in what repeats, in the things people reach for without thinking. That is where Elsewhere looks.
          </p>
        </div>

        {/* ── Malnad days wide image ── */}
        <div style={{ position: 'absolute', height: 518, left: 533, top: 2300, width: 899, overflow: 'hidden' }}>
          <img alt="Malnad days" style={{ position: 'absolute', height: '103.41%', left: '-1.81%', maxWidth: 'none', top: 0, width: '101.81%' }} src="/images/malnad-days.png" />
        </div>

        {/* ── Consulting Section (Image + Text) ── */}
        <div style={{ position: 'absolute', height: 320, left: 80, top: 2900, width: 450, overflow: 'hidden' }}>
          <img alt="Taste of Konkan" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/taste-of-konkan.png" />
        </div>

        <div style={{ position: 'absolute', left: 580, top: 2900, width: 550, color: '#505050', fontSize: 16, lineHeight: 1.6, ...mont }}>
          <p style={{ fontWeight: 700, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000' }}>For Brands and Institutions</p>
          <p style={{ fontWeight: 400, textAlign: 'justify', margin: 0 }}>
            Elsewhere works with brands, institutions, and cultural ventures that need more than content. The practice is concerned with how stories are found, shaped, and carried across image, language, experience, and form.
          </p>
          <br />
        </div>

        {/* ── Shaped by Time Section (Text + Portrait) ── */}
        <div style={{ position: 'absolute', left: 580, top: 3150, width: 520, color: '#505050', fontSize: 16, lineHeight: 1.6, ...mont }}>
          <p style={{ fontWeight: 700, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000' }}>Narrative Research</p>
          <p style={{ fontWeight: 400, textAlign: 'justify', marginTop: 0, marginRight: 0, marginBottom: 40, marginLeft: 0 }}>
            Field-grounded inquiry into people, place, material culture, and lived context. This roots a brand, publication, or institution in real understanding before it begins to speak.
          </p>
          <p style={{ fontWeight: 700, lineHeight: 'normal', marginTop: 100, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000' }}>Story Strategy</p>
          <p style={{ fontWeight: 400, textAlign: 'justify', margin: 0 }}>
            Narrative direction for campaigns, brand worlds, editorial platforms, and cultural initiatives. This covers theme, language, structure, and the shape a story needs to take.
          </p>
        </div>

        <div style={{ position: 'absolute', height: 420, left: 1150, top: 3200, width: 280, overflow: 'hidden' }}>
          <img alt="Elderly Woman" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/elderly-woman.png" />
        </div>

        {/* ── Editorial and Documentary Commissions (Image + Text) ── */}
        <div style={{ position: 'absolute', height: 320, left: 80, top: 3550, width: 450, overflow: 'hidden' }}>
          <img alt="Editorial and documentary commission" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/rebuilding-tsunami.png" />
        </div>

        <div style={{ position: 'absolute', left: 580, top: 3570, width: 550, color: '#505050', fontSize: 16, lineHeight: 1.6, ...mont }}>
          <p style={{ fontWeight: 700, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000' }}>Editorial and Documentary Commissions</p>
          <p style={{ fontWeight: 400, textAlign: 'justify', margin: 0 }}>
            Work made through time spent close to the subject, taking the form of photography, film, sound, writing, printed matter, digital formats, or whatever form the story asks for.
          </p>
        </div>

        {/* ── Cultural Advisory (Text + Image) ── */}
        <div style={{ position: 'absolute', left: 580, top: 3800, width: 520, color: '#505050', fontSize: 16, lineHeight: 1.6, ...mont }}>
          <p style={{ fontWeight: 700, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000' }}>Cultural Advisory</p>
          <p style={{ fontWeight: 400, textAlign: 'justify', margin: 0 }}>
            Selective work with brands and founders in mobility, craft, heritage, and lifestyle, helping them locate what is distinctive and what will resonate.
          </p>
        </div>

        <div style={{ position: 'absolute', height: 420, left: 1150, top: 3850, width: 280, overflow: 'hidden' }}>
          <img alt="Cultural advisory work" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/mandur-trees.png" />
        </div>

        {/* ── Engagements transitional line ── */}
        <p style={{ position: 'absolute', left: 306, top: 4370, width: 900, color: '#000', fontSize: 24, fontWeight: 500, textAlign: 'center', lineHeight: 1.5, margin: 0, ...dm }}>
          Engagements may begin with a conversation, a field visit, a commission, or a single question that needs patient looking. If something here has slowed you down, and this way of working feels familiar, I would like to hear what you are building.
        </p>

        {/* ── Framework section ── */}
        <div style={{ position: 'absolute', left: 80, top: 4614, width: 700 }}>
          <p style={{ fontWeight: 700, fontSize: 24, color: '#000', lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 16, marginLeft: 0, ...mont }}>Framework</p>
          <p style={{ fontWeight: 400, fontSize: 16, color: '#505050', lineHeight: 1.6, textAlign: 'justify', margin: 0, ...mont }}>
            The work at Elsewhere follows a simple movement: look closely, find what holds, then give it form. Each project takes a different shape, but the method stays the same.
          </p>
        </div>

        {[
          { step: '01', title: 'Look closely', body: 'Begin in the field, with unhurried attention, listening for what sits beneath the surface.' },
          { step: '02', title: 'Find what holds', body: 'Identify the pattern beneath what is visible, the memory, the ritual, the thing a person reaches for without being asked.' },
          { step: '03', title: 'Give it form', body: 'Shape what was found into the form it asks for: photography, film, sound, writing, printed matter, graphics, games, digital experiences, or the language a brand carries forward.' },
        ].map((item, i) => (
          <div key={item.step} style={{ position: 'absolute', left: 80 + i * 464, top: 4794, width: 424, borderTop: '1px solid #ddd', paddingTop: 20 }}>
            <p style={{ fontWeight: 500, fontSize: 13, color: '#505050', textTransform: 'uppercase', letterSpacing: 1, marginTop: 0, marginRight: 0, marginBottom: 10, marginLeft: 0, ...mont }}>Step {item.step}</p>
            <p style={{ fontWeight: 700, fontSize: 20, color: '#000', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, ...mont }}>{item.title}</p>
            <p style={{ fontWeight: 400, fontSize: 15, color: '#505050', lineHeight: 1.6, textAlign: 'justify', margin: 0, ...mont }}>{item.body}</p>
          </div>
        ))}

        {/* ── Closing line ── */}
        <p style={{ position: 'absolute', left: 80, top: 5044, width: 700, color: '#000', fontStyle: 'italic', fontSize: 18, fontWeight: 500, lineHeight: 1.5, margin: 0, ...dm }}>
          What changes from project to project is the medium. What stays constant is the looking.
        </p>

        {/* ── Contact CTA ── */}
        <div style={{ position: 'absolute', left: 80, top: 5194, display: 'flex', flexDirection: 'column', gap: 40 }}>
          <p style={{ fontWeight: 500, fontSize: 28, color: '#000', width: 796, margin: 0, lineHeight: 1.4, ...dm }}>
            If something here has slowed you down, if you recognise the kind of work this is and it resonates with you- write to us.
          </p>
          <div style={{ display: 'flex', gap: 71, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, width: 70 }}>
              <p style={{ fontWeight: 400, fontSize: 14, color: '#505050', textTransform: 'uppercase', margin: 0, ...mont }}>Based in</p>
              <p style={{ fontWeight: 500, fontSize: 22, color: '#000', margin: 0, ...dm }}>India</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <p style={{ fontWeight: 400, fontSize: 14, color: '#505050', textTransform: 'uppercase', margin: 0, ...mont }}>Email</p>
              <a href="mailto:arjun@elsewhere.ink" style={{ fontWeight: 500, fontSize: 22, color: '#000', textDecoration: 'underline', whiteSpace: 'nowrap', display: 'block', ...dm }}>
                arjun@elsewhere.ink
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <p style={{ fontWeight: 400, fontSize: 14, color: '#505050', textTransform: 'uppercase', margin: 0, ...mont }}>Response time</p>
              <p style={{ fontWeight: 500, fontSize: 22, color: '#000', whiteSpace: 'nowrap', margin: 0, ...dm }}>Unhurried. Within a few days.</p>
            </div>
          </div>
        </div>

        {/* ── Photo + Contact form ── */}
        <div style={{ position: 'absolute', left: 80, top: 5444, display: 'flex', gap: 118, alignItems: 'flex-start' }}>
          <div style={{ height: 565, width: 469, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
            <img alt="" style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover', width: '100%', height: '100%' }} src="/images/neeruganti-landscape.png" />
          </div>
          <ContactForm />
        </div>

        {/* ── .elsewhere footer wordmark ── */}
        <div style={{ position: 'absolute', left: 0, top: 6144, width: W }}>
          <FooterBase />
        </div>

      </div>
    </div>
  )
}

function MobileLayout() {
  const px = 20
  const gap = 48

  return (
    <div style={{ background: '#fff', overflow: 'hidden' }}>

      {/* ── Name heading ── */}
      <div style={{ padding: `64px ${px}px 0` }}>
        <p style={{ fontSize: 38, color: '#000', textTransform: 'uppercase', lineHeight: 1.05, margin: 0, ...mont }}>
          <span style={{ fontWeight: 700 }}>Arjun</span>{'\n'}
          <span style={{ fontWeight: 400 }}>Swaminathan</span>
        </p>
      </div>

      {/* ── Intro paragraph ── */}
      <div style={{ padding: `20px ${px}px 0` }}>
        <p style={{ color: '#505050', fontSize: 14, fontWeight: 400, lineHeight: 1.6, margin: 0, ...mont }}>
          I work at the intersection of movement, culture, and human experience. Slowly, staying long enough for a place to reveal itself.
        </p>
      </div>

      {/* ── Portrait ── */}
      <div style={{ marginTop: 28 }}>
        <div style={{ width: '100%', aspectRatio: '4/5', position: 'relative', overflow: 'hidden' }}>
          <img alt="Arjun portrait" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/arjun-portrait.png" />
        </div>
      </div>

      {/* ── Moto + Bio text 1 side by side ── */}
      <div style={{ display: 'flex', gap: 16, padding: `24px ${px}px 0`, alignItems: 'flex-start' }}>
        <div style={{ width: '38%', flexShrink: 0, aspectRatio: '2/3', position: 'relative', overflow: 'hidden' }}>
          <img alt="" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/arjun-moto.png" />
        </div>
        <p style={{ flex: 1, color: '#505050', fontSize: 13, fontWeight: 400, lineHeight: 1.6, margin: 0, ...mont }}>
          {`For over fifteen years, I've used photography, film, sound, and writing to follow people whose lives are closely tied to land, craft, and the quiet rituals that hold things together. People in India's hinterlands, and beyond — those whose knowledge lives in hands, in engines, in the dust of a road, in the weave of a fabric.`}
        </p>
      </div>

      {/* ── Sitting + River scene photos ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: gap, padding: `0 ${px}px` }}>
        <div style={{ flex: 1, aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
          <img alt="" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/arjun-sitting.png" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
            <img alt="" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/river-scene.png" />
          </div>
        </div>
      </div>

      {/* ── Bio text 2 ── */}
      <div style={{ padding: `24px ${px}px 0`, paddingLeft: px + 20 }}>
        <p style={{ color: '#505050', fontSize: 13, fontWeight: 400, lineHeight: 1.6, margin: 0, ...mont }}>
          {`I find myself drawn to stories of risk, repair, and survival. The kind that rarely travel far from where they were made. Stories that live in local governance, in biodiversity, in the oral traditions passed between generations in languages that don't always have a written form. Everywhere I go, I am humbled by the trust placed in me — to listen carefully enough, and to carry what I hear without breaking it.`}
        </p>
      </div>

      {/* ── Quote block ── */}
      <div style={{ padding: `${gap}px ${px}px 0`, paddingLeft: px + 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 20, width: 23, flexShrink: 0 }}>
            <img alt="" style={{ display: 'block', width: '100%', height: '100%' }} src="/icons/open-quote.svg" />
          </div>
          <p style={{ fontWeight: 500, fontStyle: 'italic', fontSize: 20, color: '#000', textTransform: 'uppercase', lineHeight: 1.3, margin: 0, ...dm }}>
            {`My heart rests somewhere between a slab of cold stone and a hot cup of tea, listening to a story of how one spell of hard rain changed the course of three generations, or how a root, a leaf, and a mushroom once saved a man's life.`}
          </p>
        </div>
        <p style={{ fontWeight: 400, fontSize: 14, color: '#505050', lineHeight: 'normal', marginTop: 24, marginRight: 0, marginBottom: 0, marginLeft: 0, ...mont }}>
          That, to me, is home.
        </p>
      </div>

      {/* ── Elsewhere section ── */}
      <div style={{ padding: `${gap}px ${px}px 0` }}>
        <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000', ...mont }}>Elsewhere</p>
        <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: '#505050', margin: 0, ...mont }}>
          Elsewhere sits at the intersection of culture, movement, and human experience. It began as a question: what happens when you stay in a place long enough for it to stop performing for you?
        </p>
        <br />
        <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: '#505050', margin: 0, ...mont }}>
          What you find there — in the margins, in the repetition, in the things people reach for without thinking — is where the real stories live.
        </p>
      </div>

      {/* ── Malnad days image ── */}
      <div style={{ marginTop: 24 }}>
        <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
          <img alt="Malnad days" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/malnad-days.png" />
        </div>
      </div>

      {/* ── Taste of Konkan image ── */}
      <div style={{ marginTop: gap, padding: `0 ${px}px` }}>
        <div style={{ width: '70%', aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
          <img alt="Taste of Konkan" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/taste-of-konkan.png" />
        </div>
      </div>

      {/* ── For Brands and Institutions ── */}
      <div style={{ padding: `24px ${px}px 0`, paddingLeft: px + 20 }}>
        <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000', ...mont }}>For Brands and Institutions</p>
        <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: '#505050', margin: 0, ...mont }}>
          Elsewhere works with brands, institutions, and cultural ventures that need more than content. The practice is concerned with how stories are found, shaped, and carried across image, language, experience, and form.
        </p>
      </div>

      {/* ── Elderly woman photo ── */}
      <div style={{ marginTop: gap, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '60%', aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
          <img alt="Elderly Woman" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/elderly-woman.png" />
        </div>
      </div>

      {/* ── Narrative Research / Story Strategy ── */}
      <div style={{ padding: `24px ${px}px 0`, paddingLeft: px + 20 }}>
        <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000', ...mont }}>Narrative Research</p>
        <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: '#505050', marginTop: 0, marginRight: 0, marginBottom: 24, marginLeft: 0, ...mont }}>
          Field-grounded inquiry into people, place, material culture, and lived context. This roots a brand, publication, or institution in real understanding before it begins to speak.
        </p>
        <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000', ...mont }}>Story Strategy</p>
        <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: '#505050', margin: 0, ...mont }}>
          Narrative direction for campaigns, brand worlds, editorial platforms, and cultural initiatives. This covers theme, language, structure, and the shape a story needs to take.
        </p>
      </div>

      {/* ── Editorial and Documentary Commissions ── */}
      <div style={{ padding: `${gap}px ${px}px 0`, paddingLeft: px + 20 }}>
        <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000', ...mont }}>Editorial and Documentary Commissions</p>
        <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: '#505050', margin: 0, ...mont }}>
          Work made through time spent close to the subject, taking the form of photography, film, sound, writing, printed matter, digital formats, or whatever form the story asks for.
        </p>
      </div>

      {/* ── Editorial commission photo ── */}
      <div style={{ marginTop: gap, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '60%', aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
          <img alt="Editorial and documentary commission" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/rebuilding-tsunami.png" />
        </div>
      </div>

      {/* ── Cultural Advisory ── */}
      <div style={{ padding: `24px ${px}px 0`, paddingLeft: px + 20 }}>
        <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 12, marginLeft: 0, color: '#000', ...mont }}>Cultural Advisory</p>
        <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: '#505050', margin: 0, ...mont }}>
          Selective work with brands and founders in mobility, craft, heritage, and lifestyle, helping them locate what is distinctive and what will resonate.
        </p>
      </div>

      {/* ── Mandur trees image ── */}
      <div style={{ marginTop: gap, padding: `0 ${px}px` }}>
        <div style={{ width: '70%', aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
          <img alt="Cultural advisory work" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/mandur-trees.png" />
        </div>
      </div>

      {/* ── Engagements transitional line ── */}
      <div style={{ padding: `${gap}px ${px}px 0` }}>
        <p style={{ fontWeight: 500, fontSize: 18, color: '#000', lineHeight: 1.5, margin: 0, ...dm }}>
          Engagements may begin with a conversation, a field visit, a commission, or a single question that needs patient looking. If something here has slowed you down, and this way of working feels familiar, I would like to hear what you are building.
        </p>
      </div>

      {/* ── Framework ── */}
      <div style={{ padding: `${gap}px ${px}px 0` }}>
        <p style={{ fontWeight: 700, fontSize: 20, lineHeight: 'normal', marginTop: 0, marginRight: 0, marginBottom: 14, marginLeft: 0, color: '#000', ...mont }}>Framework</p>
        <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: '#505050', margin: 0, ...mont }}>
          The work at Elsewhere follows a simple movement: look closely, find what holds, then give it form. Each project takes a different shape, but the method stays the same.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: `28px ${px}px 0` }}>
        {[
          { step: '01', title: 'Look closely', body: 'Begin in the field, with unhurried attention, listening for what sits beneath the surface.' },
          { step: '02', title: 'Find what holds', body: 'Identify the pattern beneath what is visible, the memory, the ritual, the thing a person reaches for without being asked.' },
          { step: '03', title: 'Give it form', body: 'Shape what was found into the form it asks for: photography, film, sound, writing, printed matter, graphics, games, digital experiences, or the language a brand carries forward.' },
        ].map((item) => (
          <div key={item.step} style={{ borderTop: '1px solid #ddd', paddingTop: 16 }}>
            <p style={{ fontWeight: 500, fontSize: 11, color: '#505050', textTransform: 'uppercase', letterSpacing: 1, marginTop: 0, marginRight: 0, marginBottom: 8, marginLeft: 0, ...mont }}>Step {item.step}</p>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#000', marginTop: 0, marginRight: 0, marginBottom: 10, marginLeft: 0, ...mont }}>{item.title}</p>
            <p style={{ fontWeight: 400, fontSize: 14, color: '#505050', lineHeight: 1.6, margin: 0, ...mont }}>{item.body}</p>
          </div>
        ))}
      </div>

      {/* ── Closing line ── */}
      <div style={{ padding: `${gap}px ${px}px 0` }}>
        <p style={{ fontWeight: 500, fontStyle: 'italic', fontSize: 15, color: '#000', lineHeight: 1.5, margin: 0, ...dm }}>
          What changes from project to project is the medium. What stays constant is the looking.
        </p>
      </div>

      {/* ── Contact CTA ── */}
      <div style={{ padding: `${gap + 16}px ${px}px 0` }}>
        <p style={{ fontWeight: 500, fontSize: 20, color: '#000', margin: 0, lineHeight: 1.4, ...dm }}>
          If something here has slowed you down, if you recognise the kind of work this is and it resonates with you&#8202;—&#8202;write to us.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 28 }}>
          <div style={{ display: 'flex', gap: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontWeight: 400, fontSize: 11, color: '#505050', textTransform: 'uppercase', margin: 0, ...mont }}>Based in</p>
              <p style={{ fontWeight: 500, fontSize: 16, color: '#000', margin: 0, ...dm }}>India</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontWeight: 400, fontSize: 11, color: '#505050', textTransform: 'uppercase', margin: 0, ...mont }}>Email</p>
              <a href="mailto:arjun@elsewhere.ink" style={{ fontWeight: 500, fontSize: 16, color: '#000', textDecoration: 'underline', display: 'block', ...dm }}>
                arjun@elsewhere.ink
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontWeight: 400, fontSize: 11, color: '#505050', textTransform: 'uppercase', margin: 0, ...mont }}>Response time</p>
            <p style={{ fontWeight: 500, fontSize: 16, color: '#000', margin: 0, ...dm }}>Unhurried. Within a few days.</p>
          </div>
        </div>
      </div>

      {/* ── Landscape photo ── */}
      <div style={{ marginTop: gap }}>
        <div style={{ width: '100%', aspectRatio: '16/10', position: 'relative', overflow: 'hidden' }}>
          <img alt="" style={{ position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' }} src="/images/neeruganti-landscape.png" />
        </div>
      </div>

      {/* ── Contact form ── */}
      <div style={{ padding: `${gap}px ${px}px 0` }}>
        <ContactForm mobile />
      </div>

      {/* ── Footer wordmark ── */}
      <div style={{ marginTop: gap + 16 }}>
        <FooterBase />
      </div>

    </div>
  )
}

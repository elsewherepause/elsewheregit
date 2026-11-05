'use client'

import { useState, useRef, useTransition, type ComponentType } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateProject, publishProject, unpublishProject, changeProjectTemplate } from '@/actions/project.actions'
import MediaPicker from '@/components/admin/media/MediaPicker'
import { SLOT_PATTERN } from '@/lib/homepage-slots'
import type { Project, MediaAsset } from '@prisma/client'
import ImageAdjustControl from '@/components/admin/shared/ImageAdjustControl'
import { inputCls, textareaCls, hasContent, type ImageAdjust, type Section, type TemplateData, type Pattern, DEFAULT_ADJUST } from './shared'

type FullProject = Project & { heroImage: MediaAsset | null; ogImage: MediaAsset | null }

// Pulls the real target aspect ratio out of labels like "Main image (691x520)" —
// the preview box must match it, since object-fit:cover crops differently per aspect ratio.
function aspectFromLabel(label: string): number | undefined {
  const m = label.match(/(\d+)\s*[x×]\s*(\d+)/i)
  if (!m) return undefined
  return parseInt(m[1], 10) / parseInt(m[2], 10)
}

function SectionAccordion({
  index, patternCount, patterns, isOpen, sData, onToggle, onImagePick, onImageRemove, onAdjustChange, onFieldChange, onRemove,
}: {
  index: number
  patternCount: number
  patterns: Pattern[]
  isOpen: boolean
  sData: Partial<Section>
  onToggle: () => void
  onImagePick: (field: string) => void
  onImageRemove: (field: string) => void
  onAdjustChange: (field: string, adj: ImageAdjust) => void
  onFieldChange: (field: string, value: string) => void
  onRemove: () => void
}) {
  const pat = patterns[index % patternCount]
  const filled = pat.images.filter(i => sData[i.field]).length
    + pat.texts.filter(t => sData[t.field as keyof Section]).length
  const total = pat.images.length + pat.texts.length
  const num = String(index + 1).padStart(2, '0')
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  return (
    <div className="border-b border-gray-100">
      <button
        className="w-full flex items-center justify-between py-3 text-left group"
        onClick={onToggle}
      >
        <div className="min-w-0">
          <span className="text-xs font-medium uppercase tracking-widest text-black">Section {num}</span>
          <span className="ml-2 text-[10px] text-gray-400 truncate">{pat.desc}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-[10px] text-gray-400">{filled}/{total}</span>
          <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="pb-4 space-y-4">
          {pat.images.map(img => {
            const id = sData[img.field] as string | undefined
            const adjField = (img.field + 'Adjust') as keyof Section
            const adj = (sData[adjField] as ImageAdjust | undefined) ?? DEFAULT_ADJUST
            return (
              <ImageAdjustControl
                key={img.field}
                cloudName={cloudName ?? ''}
                imageId={id}
                label={img.label}
                adj={adj}
                onPick={() => onImagePick(img.field)}
                onAdjust={a => onAdjustChange(img.field + 'Adjust', a)}
                onRemove={id ? () => onImageRemove(img.field) : undefined}
                aspect={aspectFromLabel(img.label)}
              />
            )
          })}

          {pat.texts.map(txt => (
            <div key={txt.field} className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400">{txt.label}</label>
              {txt.multiline ? (
                <textarea
                  value={(sData[txt.field as keyof Section] as string) || ''}
                  onChange={e => onFieldChange(txt.field, e.target.value)}
                  className={textareaCls}
                  rows={4}
                />
              ) : (
                <input
                  type="text"
                  value={(sData[txt.field as keyof Section] as string) || ''}
                  onChange={e => onFieldChange(txt.field, e.target.value)}
                  className={inputCls}
                />
              )}
            </div>
          ))}

          <button
            onClick={onRemove}
            className="text-[10px] text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
          >
            Remove section
          </button>
        </div>
      )}
    </div>
  )
}

const TEMPLATE_OPTIONS = [
  { value: 'TEMPLATE_1', label: 'Template 1' },
  { value: 'TEMPLATE_2', label: 'Template 2' },
  { value: 'TEMPLATE_3', label: 'Template 3' },
  { value: 'TEMPLATE_4', label: 'Template 4' },
] as const

function ChangeTemplateModal({
  currentTemplate, onCancel, onConfirm, changing, error,
}: {
  currentTemplate: string
  onCancel: () => void
  onConfirm: (template: string) => void
  changing: boolean
  error: string | null
}) {
  const others = TEMPLATE_OPTIONS.filter(t => t.value !== currentTemplate)
  const [selected, setSelected] = useState<string>(others[0]?.value ?? '')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-widest">Change Template</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Switching templates will permanently clear all section text and images.
          The hero image, title, location, and other project info will be kept.
          This cannot be undone.
        </p>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-gray-400">New Template</label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className={`${inputCls} bg-transparent`}
          >
            {others.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-[11px] text-red-600 bg-red-50 px-2 py-1 rounded">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            disabled={changing}
            className="flex-1 py-2 border border-gray-300 text-[10px] uppercase tracking-widest text-gray-600 hover:border-black hover:text-black transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={changing || !selected}
            className="flex-1 py-2 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            {changing ? 'Switching…' : 'Switch Template'}
          </button>
        </div>
      </div>
    </div>
  )
}

type LayoutProps = {
  data: Partial<TemplateData>
  isEditing?: boolean
  onImageSelect?: (sectionIndex: string, field: string) => void
}

type Props = {
  project: FullProject
  patterns: Pattern[]
  Layout: ComponentType<LayoutProps>
  homepageSlot?: { w: number; h: number } | null
}

export default function TemplateEditor({ project, patterns, Layout, homepageSlot }: Props) {
  const patternCount = patterns.length
  const router = useRouter()

  const [title, setTitle] = useState(project.title)
  const [slug, setSlug] = useState(project.slug)
  const [category, setCategory] = useState<'CULTURE' | 'ADVENTURE' | ''>(
    (project as Record<string, unknown>).category as 'CULTURE' | 'ADVENTURE' | '' ?? ''
  )
  const [templateData, setTemplateData] = useState<Partial<TemplateData>>(() => {
    const raw = project.templateData
      ? (typeof project.templateData === 'string'
          ? JSON.parse(project.templateData)
          : (project.templateData as Record<string, unknown>))
      : {}
    if (raw.sections) return raw as Partial<TemplateData>
    return { ...raw, sections: [] }
  })

  const [openSection, setOpenSection] = useState<string | null>('meta')
  const [pickerTarget, setPickerTarget] = useState<string | null>(null)
  const [saving, startSave] = useTransition()
  const [publishing, startPublish] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [changingTemplate, startChangeTemplate] = useTransition()
  const [templateError, setTemplateError] = useState<string | null>(null)
  const lastFocusedRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  function wrapSelection(marker: string) {
    const el = lastFocusedRef.current
    if (!el) return
    if (!(el instanceof HTMLTextAreaElement) && el.dataset.formattable === undefined) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const val = el.value
    const selected = val.slice(start, end)
    if (!selected) return
    const wrapped = `${marker}${selected}${marker}`
    const next = val.slice(0, start) + wrapped + val.slice(end)
    const nativeSet = Object.getOwnPropertyDescriptor(
      el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      'value'
    )?.set
    nativeSet?.call(el, next)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.focus()
    el.setSelectionRange(start + marker.length, end + marker.length)
  }

  const sections = templateData.sections ?? []

  function setSection(index: number, field: string, value: unknown) {
    setTemplateData(prev => {
      const secs = [...(prev.sections ?? [])]
      secs[index] = { ...(secs[index] ?? {}), [field]: value }
      return { ...prev, sections: secs }
    })
  }

  function addSection() {
    setTemplateData(prev => ({
      ...prev,
      sections: [...(prev.sections ?? []), {}],
    }))
    setOpenSection(`section-${sections.length}`)
  }

  function removeSection(index: number) {
    setTemplateData(prev => {
      const secs = [...(prev.sections ?? [])]
      secs.splice(index, 1)
      return { ...prev, sections: secs }
    })
    setOpenSection(null)
  }

  function setMeta(field: keyof TemplateData, value: unknown) {
    setTemplateData(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    startSave(async () => {
      const res = await updateProject(project.id, { title, slug, templateData, category: category || null })
      if (res?.error) setError(res.error)
      else { setError(null); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    })
  }

  function handlePublishToggle() {
    startPublish(async () => {
      if (project.published) await unpublishProject(project.id)
      else await publishProject(project.id)
    })
  }

  function openPicker(sectionKey: string, field: string) {
    setPickerTarget(`${sectionKey}.${field}`)
  }

  function handleChangeTemplate(template: string) {
    startChangeTemplate(async () => {
      const res = await changeProjectTemplate(project.id, template as 'TEMPLATE_1' | 'TEMPLATE_2' | 'TEMPLATE_3' | 'TEMPLATE_4')
      if (res?.error) {
        setTemplateError(res.error)
        return
      }
      setShowTemplateModal(false)
      setTemplateError(null)
      router.refresh()
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="w-80 flex-shrink-0 border-r border-gray-100 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/admin/projects" className="text-xs text-gray-400 hover:text-black transition-colors">
              ← Projects
            </Link>
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
              project.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {project.published ? 'Published' : 'Draft'}
            </span>
          </div>

          {error && <p className="text-[11px] text-red-600 bg-red-50 px-2 py-1 rounded mb-2">{error}</p>}
          {saved && <p className="text-[11px] text-green-600 bg-green-50 px-2 py-1 rounded mb-2">Saved</p>}

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 bg-black text-white text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={handlePublishToggle} disabled={publishing}
              className={`flex-1 py-2 text-[10px] uppercase tracking-widest border transition-colors disabled:opacity-40 ${
                project.published
                  ? 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                  : 'border-green-500 text-green-600 hover:bg-green-50'
              }`}>
              {publishing ? '…' : project.published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
          {project.published && (
            <Link href={`/${project.slug}`} target="_blank"
              className="mt-2 block text-center text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              View live ↗
            </Link>
          )}

          <button
            onClick={() => { setTemplateError(null); setShowTemplateModal(true) }}
            className="mt-2 w-full py-2 border border-gray-300 text-[10px] uppercase tracking-widest text-gray-600 hover:border-black hover:text-black transition-colors"
          >
            Change Template
          </button>

          {/* ── Bold / Italic toolbar ── */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 mr-2">Format</span>
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); wrapSelection('**') }}
              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:border-black hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700"
              title="Bold — wrap selection with **"
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); wrapSelection('*') }}
              className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:border-black hover:bg-gray-50 transition-colors text-sm italic text-gray-700"
              title="Italic — wrap selection with *"
            >
              I
            </button>
            <span className="text-[9px] text-gray-300 ml-2">Select text first</span>
          </div>
        </div>

        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div className="flex-1 px-5 py-4 overflow-y-auto" onFocusCapture={e => {
          const t = e.target
          if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
            lastFocusedRef.current = t
          }
        }}>
          {/* Meta */}
          <div className="border-b border-gray-100">
            <button className="w-full flex items-center justify-between py-3 text-left"
              onClick={() => setOpenSection(openSection === 'meta' ? null : 'meta')}>
              <span className="text-xs font-medium uppercase tracking-widest text-black">Project Info</span>
              <span className="text-gray-400 text-xs">{openSection === 'meta' ? '▲' : '▼'}</span>
            </button>

            {openSection === 'meta' && (
              <div className="pb-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Project Title (internal)</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="My Project" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">URL Slug</label>
                  <input value={slug} onChange={e => setSlug(e.target.value)} className={`${inputCls} font-mono text-xs`} placeholder="my-project" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as 'CULTURE' | 'ADVENTURE' | '')}
                    className={`${inputCls} bg-transparent`}
                  >
                    <option value="">None</option>
                    <option value="CULTURE">Culture</option>
                    <option value="ADVENTURE">Adventure</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Title</label>
                  <input data-formattable="" value={(templateData.titleBold as string) || ''} onChange={e => setMeta('titleBold', e.target.value)} className={inputCls} placeholder="Project Title" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Location</label>
                  <input value={(templateData.location as string) || ''} onChange={e => setMeta('location', e.target.value)} className={inputCls} placeholder="City, State" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">GPS Coordinates</label>
                  <input value={(templateData.coordinates as string) || ''} onChange={e => setMeta('coordinates', e.target.value)} className={inputCls} placeholder="12.97°N, 77.59°E" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Camera</label>
                  <input value={(templateData.camera as string) || ''} onChange={e => setMeta('camera', e.target.value)} className={inputCls} placeholder="Camera model" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-gray-400">Podcast Episodes (Spotify)</label>
                  {((templateData.podcastSpotifyUrls as string[]) || []).map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={url}
                        onChange={e => {
                          const urls = [...((templateData.podcastSpotifyUrls as string[]) || [])]
                          urls[i] = e.target.value
                          setMeta('podcastSpotifyUrls', urls)
                        }}
                        className={inputCls}
                        placeholder="https://open.spotify.com/episode/..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const urls = [...((templateData.podcastSpotifyUrls as string[]) || [])]
                          urls.splice(i, 1)
                          setMeta('podcastSpotifyUrls', urls)
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors text-sm flex-shrink-0"
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const urls = [...((templateData.podcastSpotifyUrls as string[]) || []), '']
                      setMeta('podcastSpotifyUrls', urls)
                    }}
                    className="text-[10px] text-gray-400 hover:text-black uppercase tracking-widest transition-colors"
                  >+ Add podcast link</button>
                </div>
                <ImageAdjustControl
                  cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''}
                  imageId={templateData.heroImage}
                  label="Hero Image (1352×671)"
                  adj={(templateData.heroImageAdjust as ImageAdjust | undefined) ?? DEFAULT_ADJUST}
                  onPick={() => openPicker('hero', 'heroImage')}
                  onAdjust={a => setMeta('heroImageAdjust', a)}
                  onRemove={templateData.heroImage ? () => setMeta('heroImage', undefined) : undefined}
                  aspect={1352 / 671}
                />
                {templateData.heroImage && (
                  <ImageAdjustControl
                    cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''}
                    imageId={templateData.heroImage}
                    label="Homepage Canvas Crop"
                    adj={(templateData.homepageHeroAdjust as ImageAdjust | undefined) ?? DEFAULT_ADJUST}
                    onPick={() => openPicker('hero', 'heroImage')}
                    onAdjust={a => setMeta('homepageHeroAdjust', a)}
                    onRemove={() => setMeta('heroImage', undefined)}
                    aspect={homepageSlot ? homepageSlot.w / homepageSlot.h : undefined}
                  />
                )}
              </div>
            )}
          </div>

          {/* Sections */}
          {sections.map((_, i) => (
            <SectionAccordion
              key={i}
              index={i}
              patternCount={patternCount}
              patterns={patterns}
              isOpen={openSection === `section-${i}`}
              sData={sections[i] ?? {}}
              onToggle={() => setOpenSection(openSection === `section-${i}` ? null : `section-${i}`)}
              onImagePick={field => openPicker(String(i), field)}
              onImageRemove={field => setSection(i, field, undefined)}
              onAdjustChange={(field, adj) => setSection(i, field, adj)}
              onFieldChange={(field, value) => setSection(i, field, value)}
              onRemove={() => removeSection(i)}
            />
          ))}

          <div className="pt-4 pb-6">
            <button onClick={addSection}
              className="w-full py-3 border border-dashed border-gray-300 text-[10px] uppercase tracking-widest text-gray-500 hover:border-black hover:text-black transition-colors">
              + Add Section {String(sections.length + 1).padStart(2, '0')}
              {sections.length > 0 && (
                <span className="ml-2 text-gray-400 normal-case tracking-normal">
                  — {patterns[sections.length % patternCount].desc}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-white shadow-xl min-h-screen">
          <Layout
            data={templateData}
            isEditing
            onImageSelect={(sk, field) => openPicker(sk, field)}
          />
        </div>
      </main>

      {showTemplateModal && (
        <ChangeTemplateModal
          currentTemplate={project.template}
          changing={changingTemplate}
          error={templateError}
          onCancel={() => { setShowTemplateModal(false); setTemplateError(null) }}
          onConfirm={handleChangeTemplate}
        />
      )}

      {pickerTarget && (
        <MediaPicker
          onSelect={asset => {
            if (!pickerTarget) return
            const [sk, field] = pickerTarget.split('.')
            if (sk === 'hero') {
              setMeta('heroImage', asset.cloudinaryId)
            } else {
              setSection(parseInt(sk, 10), field, asset.cloudinaryId)
            }
            setPickerTarget(null)
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import StoryView from '@/components/public/story/StoryView'
import { saveStory, saveAndPublish, setPublished, deleteProject } from '@/actions/project.actions'
import { newBlockId, type BlockType, type Story, type StoryBlock } from '@/lib/story/types'
import { slugify } from '@/lib/utils/slugify'
import { BlockInspector, CoverInspector } from './Inspector'

type Category = 'CULTURE' | 'ADVENTURE' | null
type Props = {
  project: { id: string; title: string; slug: string; category: Category; published: boolean; updatedAt: string }
  initialStory: Story
  /** true when the story was converted from the old Template 1–4 data and hasn’t been saved yet */
  converted: boolean
}
type Msg = { kind: 'ok' | 'error' | 'info'; text: string } | null

const NAMES: Record<BlockType, string> = { chapter: 'Chapter', text: 'Text', photos: 'Photos', quote: 'Quote' }
function summary(b: StoryBlock): string {
  switch (b.type) {
    case 'chapter': return b.title || 'No title yet'
    case 'text': return b.text.trim().slice(0, 60) || 'Empty'
    case 'quote': return b.text.trim().slice(0, 60) || 'Empty'
    case 'photos': return b.photos.length ? `${b.photos.length} photo${b.photos.length === 1 ? '' : 's'} · laid out automatically` : 'No photos yet'
  }
}
function isEmpty(b: StoryBlock) {
  return b.type === 'photos' ? b.photos.length === 0 : b.type === 'chapter' ? !b.title.trim() : !b.text.trim()
}

function Row({ block, selected, onSelect, onDelete, onDuplicate }: { block: StoryBlock; selected: boolean; onSelect: () => void; onDelete: () => void; onDuplicate: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`group flex items-center gap-2 border bg-white ${selected ? 'border-black' : 'border-[#e8e8e8] hover:border-[#bbb]'}`}>
      <button type="button" {...attributes} {...listeners} className="pl-2.5 py-3 cursor-grab active:cursor-grabbing text-[#b5b5b5] hover:text-black touch-none" aria-label={`Drag to move ${NAMES[block.type]}`}>
        <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true" fill="currentColor"><circle cx="2" cy="2" r="1.3"/><circle cx="8" cy="2" r="1.3"/><circle cx="2" cy="7" r="1.3"/><circle cx="8" cy="7" r="1.3"/><circle cx="2" cy="12" r="1.3"/><circle cx="8" cy="12" r="1.3"/></svg>
      </button>
      <button type="button" onClick={onSelect} className="flex-1 min-w-0 text-left py-2.5" aria-current={selected || undefined}>
        <span className="block text-xs font-semibold">{NAMES[block.type]}</span>
        <span className={`block text-[11px] truncate ${isEmpty(block) ? 'text-[#a33a1a]' : 'text-[#767676]'}`}>{summary(block)}</span>
      </button>
      <span className="flex pr-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
        <button type="button" onClick={onDuplicate} className="w-7 h-7 text-[#767676] hover:text-black text-xs" aria-label="Duplicate">⧉</button>
        <button type="button" onClick={onDelete} className="w-7 h-7 text-[#767676] hover:text-[#a33a1a]" aria-label={`Delete ${NAMES[block.type]}`}>×</button>
      </span>
    </li>
  )
}

export default function StoryEditor({ project, initialStory, converted }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(project.title)
  const [slug, setSlug] = useState(project.slug)
  const [category, setCategory] = useState<Category>(project.category)
  const [story, setStory] = useState<Story>(initialStory)
  const [selected, setSelected] = useState<string>('cover')
  const [device, setDevice] = useState<'desktop' | 'narrow'>('desktop')
  const [msg, setMsg] = useState<Msg>(converted ? { kind: 'info', text: 'This story was made with the old templates and has been converted. Check it over, then save — the old version stays as a backup.' } : null)
  const [pending, start] = useTransition()
  const snapshot = useCallback(() => JSON.stringify({ title, slug, category, story }), [title, slug, category, story])
  const [saved, setSaved] = useState(() => (converted ? '' : JSON.stringify({ title: project.title, slug: project.slug, category: project.category, story: initialStory })))
  const dirty = snapshot() !== saved
  const published = project.published

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', onBefore)
    return () => window.removeEventListener('beforeunload', onBefore)
  }, [dirty])

  const input = useMemo(() => ({ title, slug: slugify(slug || title), category, story }), [title, slug, category, story])

  const run = useCallback((what: 'save' | 'publish' | 'unpublish') => {
    start(async () => {
      setMsg(null)
      const snap = snapshot()
      if (what === 'unpublish') {
        if (dirty) {
          const s = await saveStory(project.id, input)
          if (!s.ok) { setMsg({ kind: 'error', text: s.error }); return }
          setSaved(snap)
        }
        const r = await setPublished(project.id, false)
        setMsg(r.ok ? { kind: 'ok', text: 'Unpublished. The story is now hidden from the site.' } : { kind: 'error', text: r.error })
        return
      }
      const r = what === 'publish' ? await saveAndPublish(project.id, input) : await saveStory(project.id, input)
      if (!r.ok) { setMsg({ kind: 'error', text: r.error }); return }
      setSaved(snap)
      if (r.data.slug !== slug) setSlug(r.data.slug)
      setMsg({ kind: 'ok', text: what === 'publish' ? (published ? 'Published. The live page is updated.' : 'Published. It’s live on the site now.') : published ? 'Saved. The live page is updated.' : 'Draft saved.' })
    })
  }, [project.id, input, snapshot, dirty, slug, published])

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (!pending) run(published ? 'publish' : 'save') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [run, pending, published])

  const blocks = story.blocks
  const setBlocks = (b: StoryBlock[]) => setStory(s => ({ ...s, blocks: b }))
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const from = blocks.findIndex(b => b.id === e.active.id), to = blocks.findIndex(b => b.id === e.over!.id)
    setBlocks(arrayMove(blocks, from, to))
  }
  function add(type: BlockType) {
    const id = newBlockId()
    const b: StoryBlock = type === 'chapter' ? { id, type, title: '' } : type === 'text' ? { id, type, text: '' } : type === 'quote' ? { id, type, text: '' } : { id, type, photos: [] }
    const at = blocks.findIndex(x => x.id === selected)
    const next = [...blocks]
    next.splice(at >= 0 ? at + 1 : next.length, 0, b)
    setBlocks(next)
    setSelected(id)
  }
  function remove(id: string) {
    const b = blocks.find(x => x.id === id)
    if (b && !isEmpty(b) && !confirm(`Delete this ${NAMES[b.type].toLowerCase()} block?`)) return
    setBlocks(blocks.filter(x => x.id !== id))
    if (selected === id) setSelected('cover')
  }
  function duplicate(id: string) {
    const i = blocks.findIndex(x => x.id === id)
    const copy = { ...structuredClone(blocks[i]), id: newBlockId() }
    const next = [...blocks]; next.splice(i + 1, 0, copy); setBlocks(next); setSelected(copy.id)
  }
  function removeStory() {
    if (!confirm('Delete this story for good? This can’t be undone.')) return
    start(async () => {
      const r = await deleteProject(project.id)
      if (!r.ok) { setMsg({ kind: 'error', text: r.error }); return }
      setSaved(snapshot())
      router.push('/admin/projects')
    })
  }

  const sel = blocks.find(b => b.id === selected)
  const status = pending ? 'Saving…' : dirty ? 'Unsaved changes' : published ? 'Published · all changes saved' : 'Draft · all changes saved'

  return (
    <div className="flex h-screen overflow-hidden bg-[#ecece9]">
      <aside className="w-[360px] shrink-0 bg-white border-r border-[#e8e8e8] flex flex-col">
        <div className="p-4 border-b border-[#e8e8e8] space-y-3">
          <div className="flex items-center justify-between">
            <Link href="/admin/projects" className="text-xs text-[#767676] hover:text-black">← Stories</Link>
            <span className={`text-[11px] flex items-center gap-1.5 ${dirty ? 'text-[#a35a00]' : published ? 'text-[#1f7a3f]' : 'text-[#767676]'}`} role="status">
              <span className={`w-1.5 h-1.5 rounded-full ${dirty ? 'bg-[#d08a00]' : published ? 'bg-[#1f7a3f]' : 'bg-[#bbb]'}`} />{status}
            </span>
          </div>
          <div className="flex gap-2">
            {published ? (
              <>
                <button type="button" disabled={pending} onClick={() => run('unpublish')} className="flex-1 py-2 border border-black bg-white text-xs font-semibold disabled:opacity-40">Unpublish</button>
                <button type="button" disabled={pending || !dirty} onClick={() => run('publish')} className="flex-1 py-2 bg-black text-white text-xs font-semibold disabled:opacity-40">Publish changes</button>
              </>
            ) : (
              <>
                <button type="button" disabled={pending || !dirty} onClick={() => run('save')} className="flex-1 py-2 border border-black bg-white text-xs font-semibold disabled:opacity-40">Save draft</button>
                <button type="button" disabled={pending} onClick={() => run('publish')} className="flex-1 py-2 bg-black text-white text-xs font-semibold disabled:opacity-40">Publish</button>
              </>
            )}
          </div>
          {published && <a href={`/${project.slug}`} target="_blank" rel="noreferrer" className="block text-center text-[11px] text-[#767676] hover:text-black">View live page ↗</a>}
          {msg && (
            <p role={msg.kind === 'error' ? 'alert' : 'status'} className={`text-xs leading-relaxed px-3 py-2 border ${msg.kind === 'error' ? 'bg-[#fdf1ed] border-[#f0c9bd] text-[#a33a1a]' : msg.kind === 'ok' ? 'bg-[#eef7f1] border-[#cde6d5] text-[#1f5f33]' : 'bg-[#fff8e6] border-[#f0dfae] text-[#5a4500]'}`}>
              {msg.text} <button type="button" className="underline ml-1" onClick={() => setMsg(null)}>OK</button>
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-1.5">
            <button type="button" onClick={() => setSelected('settings')} className={`w-full text-left border px-3 py-2.5 ${selected === 'settings' ? 'border-black' : 'border-[#e8e8e8] hover:border-[#bbb]'}`}>
              <span className="block text-xs font-semibold">Story settings</span>
              <span className="block text-[11px] text-[#767676] truncate">/{slugify(slug || title) || '…'}{category ? ` · ${category === 'CULTURE' ? 'Culture' : 'Adventure'}` : ''}</span>
            </button>
            <button type="button" onClick={() => setSelected('cover')} className={`w-full text-left border px-3 py-2.5 ${selected === 'cover' ? 'border-black' : 'border-[#e8e8e8] hover:border-[#bbb]'}`}>
              <span className="block text-xs font-semibold">Cover</span>
              <span className={`block text-[11px] truncate ${story.cover.image ? 'text-[#767676]' : 'text-[#a33a1a]'}`}>{story.cover.image ? 'Title, cover photo, location, camera' : 'Needs a cover photo before publishing'}</span>
            </button>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-1.5">
                  {blocks.map(b => <Row key={b.id} block={b} selected={selected === b.id} onSelect={() => setSelected(b.id)} onDelete={() => remove(b.id)} onDuplicate={() => duplicate(b.id)} />)}
                </ul>
              </SortableContext>
            </DndContext>
            {blocks.length === 0 && <p className="text-[11px] text-[#767676] px-1 py-2">Start with a chapter, some text or a batch of photos.</p>}
            <div className="grid grid-cols-4 gap-1.5 pt-1.5">
              {(['chapter', 'text', 'photos', 'quote'] as BlockType[]).map(t => (
                <button key={t} type="button" onClick={() => add(t)} className="border border-dashed border-[#c8c8c6] bg-white py-2 text-[11px] font-semibold hover:border-black">+ {NAMES[t]}</button>
              ))}
            </div>
            <p className="text-[10px] text-[#767676] px-1">New blocks go below the one you have selected.</p>
          </div>

          <div className="border-t border-[#e8e8e8] p-4">
            {selected === 'settings' ? (
              <div className="space-y-4">
                <div><label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor="st-title">Name in the admin and menu</label><input id="st-title" className="field-input" value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor="st-slug">Web address</label>
                  <input id="st-slug" className="field-input font-mono" value={slug} onChange={e => setSlug(e.target.value)} onBlur={() => setSlug(slugify(slug || title))} />
                  <span className="block text-[11px] text-[#767676] mt-1">elsewhere.ink/{slugify(slug || title)}{published && slugify(slug || title) !== project.slug ? ' — the old address will stop working' : ''}</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor="st-cat">Category</label>
                  <select id="st-cat" className="field-input" value={category ?? ''} onChange={e => setCategory((e.target.value || null) as Category)}>
                    <option value="">None</option><option value="CULTURE">Culture</option><option value="ADVENTURE">Adventure</option>
                  </select>
                </div>
                <button type="button" onClick={removeStory} className="text-xs text-[#a33a1a] underline">Delete this story</button>
              </div>
            ) : selected === 'cover' ? (
              <CoverInspector story={story} onChange={(cover, podcasts) => setStory(s => ({ ...s, cover, ...(podcasts ? { podcasts } : {}) }))} />
            ) : sel ? (
              <BlockInspector key={sel.id} block={sel} onChange={nb => setBlocks(blocks.map(b => (b.id === nb.id ? nb : b)))} />
            ) : null}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6" aria-label="Preview">
        <div className="flex items-center justify-between mb-3 text-xs text-[#505050]">
          <span>Preview — exactly what visitors will see</span>
          <span className="inline-flex border border-[#cfcfcd] bg-white" role="group" aria-label="Preview size">
            <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} className={`px-3 py-1.5 ${device === 'desktop' ? 'bg-black text-white' : ''}`}>Desktop</button>
            <button type="button" aria-pressed={device === 'narrow'} onClick={() => setDevice('narrow')} className={`px-3 py-1.5 ${device === 'narrow' ? 'bg-black text-white' : ''}`}>Phone</button>
          </span>
        </div>
        <div className={`bg-white border border-[#d6d6d4] mx-auto pb-16 ${device === 'narrow' ? 'max-w-[392px]' : ''}`}>
          <StoryView story={story} mode={device} />
        </div>
      </main>
    </div>
  )
}

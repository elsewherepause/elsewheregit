'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { updateNote, setNotePublished, deleteNote, type Note } from '@/actions/note.actions'
import MediaPicker from '@/components/admin/media/MediaPicker'
import MediaUploader from '@/components/admin/media/MediaUploader'
import { toPhoto } from '@/components/admin/story-editor/Inspector'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import { slugify } from '@/lib/utils/slugify'
import { notePhotos, type NotePhoto } from '@/lib/notes/photos'

type Msg = { ok: boolean; text: string } | null

export default function NoteEditor({ note }: { note: Note }) {
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [slug, setSlug] = useState(note.slug)
  const [readTime, setReadTime] = useState(note.readTime)
  // Older notes have a header/footer photo; they start the list so nothing is lost.
  const [photos, setPhotos] = useState<NotePhoto[]>(() => notePhotos(note))
  const [open, setOpen] = useState<number | null>(null)
  const [picker, setPicker] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)
  const [pending, start] = useTransition()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, code: false, codeBlock: false }),
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your note…' }),
    ],
    content: note.content,
    editorProps: { attributes: { class: 'tiptap min-h-[320px] text-[15px] leading-relaxed focus:outline-none' } },
    onUpdate: () => setDirty(true),
  })

  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', onBefore)
    return () => window.removeEventListener('beforeunload', onBefore)
  }, [dirty])

  const touch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setDirty(true) }
  const setList = (list: NotePhoto[]) => { setPhotos(list); setDirty(true) }
  const addPhotos = (list: NotePhoto[]) => setList([...photos, ...list.filter(p => !photos.some(x => x.id === p.id))])
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= photos.length) return
    const next = [...photos]; [next[i], next[j]] = [next[j], next[i]]; setList(next); setOpen(j)
  }
  const patch = (i: number, p: Partial<NotePhoto>) => setList(photos.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const payload = () => ({ title, slug: slugify(slug || title), readTime, content: editor?.getHTML() ?? note.content, photos })

  function save(then?: 'publish' | 'unpublish') {
    start(async () => {
      setMsg(null)
      const r = await updateNote(note.id, payload())
      if (!r.ok) { setMsg({ ok: false, text: r.error }); return }
      setDirty(false)
      if (then) {
        const p = await setNotePublished(note.id, then === 'publish')
        if (!p.ok) { setMsg({ ok: false, text: p.error }); return }
        setMsg({ ok: true, text: then === 'publish' ? 'Published. It’s in Open Rolls now.' : 'Unpublished. It’s hidden from the site.' })
      } else setMsg({ ok: true, text: note.published ? 'Saved. The live note is updated.' : 'Draft saved.' })
    })
  }
  function remove() {
    if (!confirm('Delete this note for good? This can’t be undone.')) return
    start(async () => {
      const r = await deleteNote(note.id)
      if (!r.ok) { setMsg({ ok: false, text: r.error }); return }
      setDirty(false)
      router.push('/admin/notes')
    })
  }

  const tool = (label: string, hint: string, action: () => void, active: boolean) => (
    <button key={label} type="button" title={hint} aria-pressed={active} onClick={action}
      className={`px-2 py-1 text-xs border ${active ? 'bg-black text-white border-black' : 'border-[var(--color-border)] hover:border-black'}`}>{label}</button>
  )

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
        <Link href="/admin/notes" className="text-xs text-[#767676] hover:text-black">← Notes</Link>
        <input value={title} onChange={e => touch(setTitle)(e.target.value)} aria-label="Note title" placeholder="Note title"
          className="w-full mt-6 text-3xl font-light border-0 border-b border-[var(--color-border)] pb-3 mb-6 focus:outline-none focus:border-black bg-transparent" style={{ fontFamily: 'var(--font-heading)' }} />
        {editor && (
          <div className="flex flex-wrap gap-1 mb-3 border-b border-[var(--color-border)] pb-2">
            {tool('H2', 'Heading', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
            {tool('B', 'Bold', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
            {tool('I', 'Italic', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
            {tool('Quote', 'Quote', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
            {tool('Link', 'Add a link', () => { const url = prompt('Link address (https://…)'); if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run() }, editor.isActive('link'))}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      <aside className="w-80 shrink-0 border-l border-[var(--color-border)] overflow-y-auto bg-[var(--color-admin-bg)] p-5 space-y-6">
        <div className="space-y-2">
          <p className={`text-[11px] ${dirty ? 'text-[#a35a00]' : note.published ? 'text-[#1f7a3f]' : 'text-[#767676]'}`} role="status">
            {pending ? 'Saving…' : dirty ? 'Unsaved changes' : note.published ? 'Published · all changes saved' : 'Draft · all changes saved'}
          </p>
          {note.published ? (
            <div className="flex gap-2">
              <button type="button" disabled={pending} onClick={() => save('unpublish')} className="flex-1 py-2 border border-black bg-white text-xs font-semibold disabled:opacity-40">Unpublish</button>
              <button type="button" disabled={pending || !dirty} onClick={() => save()} className="flex-1 py-2 bg-black text-white text-xs font-semibold disabled:opacity-40">Publish changes</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button type="button" disabled={pending || !dirty} onClick={() => save()} className="flex-1 py-2 border border-black bg-white text-xs font-semibold disabled:opacity-40">Save draft</button>
              <button type="button" disabled={pending} onClick={() => save('publish')} className="flex-1 py-2 bg-black text-white text-xs font-semibold disabled:opacity-40">Publish</button>
            </div>
          )}
          {note.published && <a href={`/notes/${note.slug}`} target="_blank" rel="noreferrer" className="block text-center text-[11px] text-[#767676] hover:text-black">View live note ↗</a>}
          {msg && <p role={msg.ok ? 'status' : 'alert'} className={`text-xs px-3 py-2 border ${msg.ok ? 'bg-[#eef7f1] border-[#cde6d5] text-[#1f5f33]' : 'bg-[#fdf1ed] border-[#f0c9bd] text-[#a33a1a]'}`}>{msg.text}</p>}
        </div>
        <div><label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor="n-slug">Web address</label><input id="n-slug" className="field-input font-mono" value={slug} onChange={e => touch(setSlug)(e.target.value)} onBlur={() => setSlug(slugify(slug || title))} /></div>
        <div><label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor="n-rt">Read time</label><input id="n-rt" className="field-input" value={readTime} onChange={e => touch(setReadTime)(e.target.value)} placeholder="2 min read" /></div>

        <div className="space-y-2">
          <span className="block text-[11px] font-semibold text-[#505050]">Photos</span>
          <span className="block text-[11px] text-[#767676]">Shown after the text in a rotating frame, in this order. Add as many as you like.</span>
          <MediaUploader zone accept="image" onUploaded={list => addPhotos(list.map(toPhoto))} />
          <button type="button" className="text-xs underline" onClick={() => setPicker(true)}>Choose from the media library</button>
          <ul className="space-y-1.5 pt-1">
            {photos.map((p, i) => (
              <li key={`${p.id}-${i}`} className={`border bg-white ${open === i ? 'border-black' : 'border-[#e8e8e8]'}`}>
                <div className="flex items-center gap-2 p-1.5">
                  <button type="button" className="flex items-center gap-2 flex-1 min-w-0 text-left" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cloudinaryUrl(p.id, { height: 80, crop: 'limit' })} alt="" style={{ height: 40, width: 'auto', aspectRatio: `${p.w} / ${p.h}` }} className="bg-[#f0f0ee] block" />
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold truncate">{p.caption || `Photo ${i + 1}`}</span>
                      <span className="block text-[10px] text-[#767676]">{i === 0 ? 'Shown first' : `${i + 1} of ${photos.length}`}</span>
                    </span>
                  </button>
                  <span className="flex">
                    <button type="button" className="w-7 h-7 text-[#767676] hover:text-black disabled:opacity-20" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                    <button type="button" className="w-7 h-7 text-[#767676] hover:text-black disabled:opacity-20" disabled={i === photos.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                    <button type="button" className="w-7 h-7 text-[#767676] hover:text-[#a33a1a]" onClick={() => { setList(photos.filter((_, k) => k !== i)); setOpen(null) }} aria-label="Remove photo">×</button>
                  </span>
                </div>
                {open === i && (
                  <div className="border-t border-[#e8e8e8] p-2.5 space-y-2.5">
                    <div><label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor={`ncap-${i}`}>Caption (for your reference and screen readers)</label><input id={`ncap-${i}`} className="field-input" value={p.caption ?? ''} onChange={e => patch(i, { caption: e.target.value })} /></div>
                    <div><label className="block text-[11px] font-semibold text-[#505050] mb-1" htmlFor={`nalt-${i}`}>Describe the photo (for screen readers)</label><input id={`nalt-${i}`} className="field-input" value={p.alt ?? ''} onChange={e => patch(i, { alt: e.target.value })} /></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {photos.length === 0 && <p className="text-[11px] text-[#767676]">No photos. The note will be text only.</p>}
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]"><button type="button" onClick={remove} className="text-xs text-[#a33a1a] underline">Delete this note</button></div>
      </aside>
      {picker && <MediaPicker multiple title="Add photos to this note" onClose={() => setPicker(false)} onSelect={l => addPhotos(l.map(toPhoto))} />}
    </div>
  )
}

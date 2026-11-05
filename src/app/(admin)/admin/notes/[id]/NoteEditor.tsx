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
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import { slugify } from '@/lib/utils/slugify'

type Img = { id: string; cid: string } | null
type Msg = { ok: boolean; text: string } | null

export default function NoteEditor({ note }: { note: Note }) {
  const router = useRouter()
  const [title, setTitle] = useState(note.title)
  const [slug, setSlug] = useState(note.slug)
  const [readTime, setReadTime] = useState(note.readTime)
  const [header, setHeader] = useState<Img>(note.headerImageId && note.headerImage ? { id: note.headerImageId, cid: note.headerImage.cloudinaryId } : null)
  const [footer, setFooter] = useState<Img>(note.footerImageId && note.footerImage ? { id: note.footerImageId, cid: note.footerImage.cloudinaryId } : null)
  const [picker, setPicker] = useState<'header' | 'footer' | null>(null)
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
  const payload = () => ({ title, slug: slugify(slug || title), readTime, content: editor?.getHTML() ?? note.content, headerImageId: header?.id ?? null, footerImageId: footer?.id ?? null })

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

  const tool = (label: string, title: string, action: () => void, active: boolean) => (
    <button key={label} type="button" title={title} aria-pressed={active} onClick={action}
      className={`px-2 py-1 text-xs border ${active ? 'bg-black text-white border-black' : 'border-[var(--color-border)] hover:border-black'}`}>{label}</button>
  )
  const imgSlot = (which: 'header' | 'footer', img: Img, set: (v: Img) => void, help: string) => (
    <div>
      <span className="block text-[11px] font-semibold text-[#505050] mb-1">{which === 'header' ? 'Header photo' : 'Footer photo'}</span>
      {img ? (
        <div className="flex items-end gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cloudinaryUrl(img.cid, { width: 240, height: 160, crop: 'fill' })} alt="" className="w-32 h-20 object-cover" />
          <div className="flex flex-col gap-1 text-xs">
            <button type="button" className="underline text-left" onClick={() => setPicker(which)}>Change</button>
            <button type="button" className="underline text-left text-[#a33a1a]" onClick={() => touch(set)(null)}>Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setPicker(which)} className="w-full h-16 border border-dashed border-[#c8c8c6] text-xs text-[#505050] hover:border-black">Choose a photo</button>
      )}
      <span className="block text-[11px] text-[#767676] mt-1">{help}</span>
    </div>
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
      <aside className="w-72 shrink-0 border-l border-[var(--color-border)] overflow-y-auto bg-[var(--color-admin-bg)] p-5 space-y-6">
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
        {imgSlot('header', header, setHeader, 'Sits above the title and grows as the reader reaches the end.')}
        {imgSlot('footer', footer, setFooter, 'Shown after the text.')}
        <div className="pt-4 border-t border-[var(--color-border)]"><button type="button" onClick={remove} className="text-xs text-[#a33a1a] underline">Delete this note</button></div>
      </aside>
      {picker && (
        <MediaPicker
          title={picker === 'header' ? 'Choose the header photo' : 'Choose the footer photo'}
          onClose={() => setPicker(null)}
          onSelect={list => { const a = list[0]; const v = { id: a.id, cid: a.cloudinaryId }; if (picker === 'header') touch(setHeader)(v); else touch(setFooter)(v) }}
        />
      )}
    </div>
  )
}

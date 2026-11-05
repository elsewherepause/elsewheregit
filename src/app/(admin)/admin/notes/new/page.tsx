'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createNote } from '@/actions/note.actions'
import { slugify } from '@/lib/utils/slugify'

export default function NewNotePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const shown = touched ? slug : slugify(title)
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-medium mb-8" style={{ fontFamily: 'var(--font-heading)' }}>New note</h1>
      <form className="space-y-5" onSubmit={e => { e.preventDefault(); start(async () => { setError(null); const r = await createNote({ title, slug: shown }); if (!r.ok) setError(r.error); else router.push(`/admin/notes/${r.data.id}`) }) }}>
        {error && <p role="alert" className="text-sm text-[#a33a1a] bg-[#fdf1ed] border border-[#f0c9bd] px-3 py-2">{error}</p>}
        <div><label htmlFor="title" className="block text-xs font-semibold text-[#505050] mb-1">Title</label><input id="title" required autoFocus value={title} onChange={e => setTitle(e.target.value)} className="field-input !text-sm !py-2.5" /></div>
        <div>
          <label htmlFor="slug" className="block text-xs font-semibold text-[#505050] mb-1">Web address</label>
          <input id="slug" value={shown} onChange={e => { setTouched(true); setSlug(e.target.value) }} className="field-input !text-sm !py-2.5 font-mono" placeholder="filled in from the title" />
          <span className="block text-xs text-[#767676] mt-1">elsewhere.ink/notes/{shown || '…'}</span>
        </div>
        <button type="submit" disabled={pending || !title.trim()} className="px-6 py-2.5 bg-black text-white text-xs font-semibold disabled:opacity-40">{pending ? 'Creating…' : 'Create note'}</button>
      </form>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/actions/project.actions'
import { slugify } from '@/lib/utils/slugify'

export default function NewProjectPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [touched, setTouched] = useState(false)
  const [category, setCategory] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const shown = touched ? slug : slugify(title)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      setError(null)
      const r = await createProject({ title, slug: shown, category: category || null })
      if (!r.ok) { setError(r.error); return }
      router.push(`/admin/projects/${r.data.id}`)
    })
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-medium mb-8" style={{ fontFamily: 'var(--font-heading)' }}>New story</h1>
      <form onSubmit={submit} className="space-y-5">
        {error && <p role="alert" className="text-sm text-[#a33a1a] bg-[#fdf1ed] border border-[#f0c9bd] px-3 py-2">{error}</p>}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-[#505050] mb-1">Title</label>
          <input id="title" required autoFocus value={title} onChange={e => setTitle(e.target.value)} className="field-input !text-sm !py-2.5" />
        </div>
        <div>
          <label htmlFor="slug" className="block text-xs font-semibold text-[#505050] mb-1">Web address</label>
          <input id="slug" value={shown} onChange={e => { setTouched(true); setSlug(e.target.value) }} onBlur={() => touched && setSlug(slugify(slug))} className="field-input !text-sm !py-2.5 font-mono" placeholder="filled in from the title" />
          <span className="block text-xs text-[#767676] mt-1">elsewhere.ink/{shown || '…'}</span>
        </div>
        <div>
          <label htmlFor="category" className="block text-xs font-semibold text-[#505050] mb-1">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="field-input !text-sm !py-2.5">
            <option value="">None</option><option value="CULTURE">Culture</option><option value="ADVENTURE">Adventure</option>
          </select>
        </div>
        <button type="submit" disabled={pending || !title.trim()} className="px-6 py-2.5 bg-black text-white text-xs font-semibold disabled:opacity-40">{pending ? 'Creating…' : 'Create story'}</button>
      </form>
    </div>
  )
}

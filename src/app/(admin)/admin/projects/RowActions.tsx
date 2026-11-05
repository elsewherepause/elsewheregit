'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { setPublished, deleteProject } from '@/actions/project.actions'

export default function RowActions({ id, slug, published }: { id: string; slug: string; published: boolean }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => {
    setError(null)
    const r = await fn()
    if (!r.ok) setError(r.error ?? 'Something went wrong.')
  })
  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex items-center gap-3 text-xs">
        {published && <a href={`/${slug}`} target="_blank" rel="noreferrer" className="text-[#767676] hover:text-black">View ↗</a>}
        <button type="button" disabled={pending} onClick={() => act(() => setPublished(id, !published))} className={`${published ? 'text-[#767676] hover:text-black' : 'text-green-700 hover:text-green-900'} disabled:opacity-40`}>
          {pending ? '…' : published ? 'Unpublish' : 'Publish'}
        </button>
        <Link href={`/admin/projects/${id}`} className="px-3 py-1 border border-[var(--color-border)] hover:border-black">Edit</Link>
        <button type="button" disabled={pending} onClick={() => { if (confirm('Delete this story for good? This can’t be undone.')) act(() => deleteProject(id)) }} className="text-[#a33a1a]/70 hover:text-[#a33a1a] disabled:opacity-40">Delete</button>
      </div>
      {error && <p role="alert" className="text-[11px] text-[#a33a1a] max-w-xs text-right">{error}</p>}
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { setNotePublished } from '@/actions/note.actions'

export default function NoteRowActions({ id, slug, published }: { id: string; slug: string; published: boolean }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex items-center gap-3 text-xs">
        {published && <a href={`/notes/${slug}`} target="_blank" rel="noreferrer" className="text-[#767676] hover:text-black">View ↗</a>}
        <button type="button" disabled={pending} onClick={() => start(async () => { setError(null); const r = await setNotePublished(id, !published); if (!r.ok) setError(r.error) })}
          className={`${published ? 'text-[#767676] hover:text-black' : 'text-green-700 hover:text-green-900'} disabled:opacity-40`}>{pending ? '…' : published ? 'Unpublish' : 'Publish'}</button>
        <Link href={`/admin/notes/${id}`} className="px-3 py-1 border border-[var(--color-border)] hover:border-black">Edit</Link>
      </div>
      {error && <p role="alert" className="text-[11px] text-[#a33a1a] max-w-xs text-right">{error}</p>}
    </div>
  )
}

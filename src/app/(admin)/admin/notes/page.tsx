import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import NoteRowActions from './NoteRowActions'

export const metadata = { title: 'Notes' }

export default async function NotesPage() {
  const notes = await prisma.note.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, title: true, slug: true, published: true, readTime: true, updatedAt: true } })
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>Notes</h1>
        <Link href="/admin/notes/new" className="px-4 py-2 bg-black !text-white text-xs font-semibold">New note</Link>
      </div>
      <p className="text-xs text-[#767676] mb-6">Published notes appear under Notes in Open Rolls, newest first.</p>
      {notes.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] px-5 py-12 text-center">
          <p className="text-sm text-[#767676] mb-4">No notes yet.</p>
          <Link href="/admin/notes/new" className="text-sm underline">Write your first note</Link>
        </div>
      ) : (
        <ul className="bg-white border border-[var(--color-border)]">
          {notes.map(n => (
            <li key={n.id} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--color-border)] last:border-0">
              <span className={`shrink-0 w-2 h-2 rounded-full ${n.published ? 'bg-green-600' : 'bg-[#c0c0c0]'}`} aria-hidden="true" />
              <Link href={`/admin/notes/${n.id}`} className="flex-1 min-w-0 group">
                <span className="block text-sm font-medium truncate group-hover:underline">{n.title}</span>
                <span className="block text-xs text-[#767676] mt-0.5">{n.published ? 'Published' : 'Draft'} · {n.readTime} · edited {n.updatedAt.toLocaleDateString('en-GB')}</span>
              </Link>
              <NoteRowActions id={n.id} slug={n.slug} published={n.published} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteNote, publishNote, unpublishNote } from '@/actions/note.actions'

export const metadata = { title: 'Notes' }

export default async function NotesPage() {
  const notes = await prisma.note.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      readTime: true,
      updatedAt: true,
    },
  })

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
          Notes
        </h1>
        <Link
          href="/admin/notes/new"
          className="px-4 py-2 bg-[var(--color-ink)] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-paper)' }}
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded px-5 py-12 text-center">
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">No notes yet.</p>
          <Link href="/admin/notes/new" className="text-sm underline">Create your first note</Link>
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)] rounded">
          {notes.map((n, i) => (
            <div
              key={n.id}
              className={`flex items-center gap-4 px-5 py-4 ${i < notes.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}
            >
              <span className={`flex-shrink-0 w-2 h-2 rounded-full ${n.published ? 'bg-green-500' : 'bg-[var(--color-ink-faint)]'}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium truncate">{n.title}</span>
                  <span className="text-xs text-[var(--color-ink-muted)] font-mono hidden sm:inline">/{n.slug}</span>
                </div>
                <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  {n.readTime} · updated {new Date(n.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {n.published ? (
                  <form action={unpublishNote.bind(null, n.id)}>
                    <button type="submit" className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
                      Unpublish
                    </button>
                  </form>
                ) : (
                  <form action={publishNote.bind(null, n.id)}>
                    <button type="submit" className="text-xs text-green-600 hover:text-green-700 transition-colors">
                      Publish
                    </button>
                  </form>
                )}

                <Link
                  href={`/notes/${n.slug}`}
                  target="_blank"
                  className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  View ↗
                </Link>

                <Link
                  href={`/admin/notes/${n.id}`}
                  className="text-xs px-3 py-1 border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

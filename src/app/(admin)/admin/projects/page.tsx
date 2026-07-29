import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteProject, publishProject, unpublishProject } from '@/actions/project.actions'
import DeleteButton from './DeleteButton'

export const metadata = { title: 'Projects' }

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, title: true, slug: true,
      published: true, publishedAt: true,
      updatedAt: true,
      _count: { select: { blocks: true } },
    },
  })

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
          Projects
        </h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-black !text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded px-5 py-12 text-center">
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">No projects yet.</p>
          <Link href="/admin/projects/new" className="text-sm underline">Create your first project</Link>
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)] rounded">
          {projects.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 px-5 py-4 ${i < projects.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}
            >
              <span className={`flex-shrink-0 w-2 h-2 rounded-full ${p.published ? 'bg-green-500' : 'bg-[var(--color-ink-faint)]'}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium truncate">{p.title}</span>
                  <span className="text-xs text-[var(--color-ink-muted)] font-mono hidden sm:inline">/{p.slug}</span>
                </div>
                <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  {p._count.blocks} block{p._count.blocks !== 1 ? 's' : ''} · updated {new Date(p.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {p.published ? (
                  <form action={unpublishProject.bind(null, p.id)}>
                    <button type="submit" className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
                      Unpublish
                    </button>
                  </form>
                ) : (
                  <form action={publishProject.bind(null, p.id)}>
                    <button type="submit" className="text-xs text-green-600 hover:text-green-700 transition-colors">
                      Publish
                    </button>
                  </form>
                )}

                {p.published && (
                  <Link
                    href={`/${p.slug}`}
                    target="_blank"
                    className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    View ↗
                  </Link>
                )}

                <Link
                  href={`/admin/projects/${p.id}`}
                  className="text-xs px-3 py-1 border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors"
                >
                  Edit
                </Link>

                <DeleteButton projectId={p.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

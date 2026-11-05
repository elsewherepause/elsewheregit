import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import RowActions from './RowActions'

export const metadata = { title: 'Stories' }

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ published: 'desc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }],
    select: { id: true, title: true, slug: true, published: true, updatedAt: true },
  })
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>Stories</h1>
        <Link href="/admin/projects/new" className="px-4 py-2 bg-black !text-white text-xs font-semibold">New story</Link>
      </div>
      <p className="text-xs text-[#767676] mb-6">Published stories appear on the home page newest first.</p>
      {projects.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] px-5 py-12 text-center">
          <p className="text-sm text-[#767676] mb-4">No stories yet.</p>
          <Link href="/admin/projects/new" className="text-sm underline">Create your first story</Link>
        </div>
      ) : (
        <ul className="bg-white border border-[var(--color-border)]">
          {projects.map(p => (
            <li key={p.id} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--color-border)] last:border-0">
              <span className={`shrink-0 w-2 h-2 rounded-full ${p.published ? 'bg-green-600' : 'bg-[#c0c0c0]'}`} aria-hidden="true" />
              <Link href={`/admin/projects/${p.id}`} className="flex-1 min-w-0 group">
                <span className="block text-sm font-medium truncate group-hover:underline">{p.title}</span>
                <span className="block text-xs text-[#767676] mt-0.5">{p.published ? 'Published' : 'Draft'} · /{p.slug} · edited {p.updatedAt.toLocaleDateString('en-GB')}</span>
              </Link>
              <RowActions id={p.id} slug={p.slug} published={p.published} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

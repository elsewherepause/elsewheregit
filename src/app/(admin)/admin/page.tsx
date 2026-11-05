import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const [stories, published, rolls, notes, recent] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.galleryImage.count({ where: { published: true } }),
    prisma.note.count({ where: { published: true } }),
    prisma.project.findMany({ orderBy: { updatedAt: 'desc' }, take: 6, select: { id: true, title: true, published: true, updatedAt: true } }),
  ])
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-medium mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[['Stories', stories], ['Published', published], ['In Open Rolls', rolls], ['Notes live', notes]].map(([l, v]) => (
          <div key={l} className="bg-white border border-[var(--color-border)] p-5">
            <div className="text-3xl font-light mb-1">{v}</div>
            <div className="text-xs text-[#767676]">{l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[var(--color-border)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-medium">Recently edited</h2>
          <Link href="/admin/projects/new" className="text-xs font-semibold underline">New story</Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[#767676] text-center">No stories yet. <Link href="/admin/projects/new" className="underline">Create the first one</Link>.</p>
        ) : (
          <ul>
            {recent.map(p => (
              <li key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                <Link href={`/admin/projects/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[#fafafa]">
                  <span className="flex items-center gap-3 text-sm"><span className={`w-1.5 h-1.5 rounded-full ${p.published ? 'bg-green-600' : 'bg-[#c0c0c0]'}`} />{p.title}</span>
                  <span className="text-xs text-[#767676]">{p.published ? 'Published' : 'Draft'} · {p.updatedAt.toLocaleDateString('en-GB')}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

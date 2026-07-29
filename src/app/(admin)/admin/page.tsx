import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const [projectCount, publishedCount, mediaCount] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.mediaAsset.count(),
  ])

  const recent = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: { id: true, title: true, published: true, updatedAt: true },
  })

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-medium mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Projects', value: projectCount },
          { label: 'Published', value: publishedCount },
          { label: 'Media Assets', value: mediaCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[var(--color-border)] p-5 rounded">
            <div className="text-3xl font-light mb-1">{value}</div>
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-medium">Recent Projects</h2>
          <Link href="/admin/projects" className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-8 text-sm text-[var(--color-ink-muted)] text-center">
            No projects yet.{' '}
            <Link href="/admin/projects/new" className="underline">Create one</Link>
          </div>
        ) : (
          <ul>
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)] last:border-0">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${p.published ? 'bg-green-500' : 'bg-[var(--color-ink-faint)]'}`}
                  />
                  <span className="text-sm">{p.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    Edit →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

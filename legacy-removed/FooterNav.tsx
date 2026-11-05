import Link from 'next/link'
import TakeMeElsewhere from './TakeMeElsewhere'

type Props = {
  nextProject?: { slug: string; title: string } | null
  destinations?: { slug: string }[]
}

export default function FooterNav({ nextProject, destinations = [] }: Props) {
  return (
    <>
      {/* Mobile: stacked */}
      <div
        className="flex flex-col items-center gap-3 mb-16 px-6 md:hidden"
        style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 14, color: '#ccc', textTransform: 'uppercase' }}
      >
        <TakeMeElsewhere destinations={destinations} />
        {nextProject && (
          <Link
            href={`/${nextProject.slug}`}
            className="flex items-center gap-1.5 hover:opacity-60 transition-opacity"
            style={{ textDecoration: 'none', color: '#ccc' }}
          >
            Next project <span style={{ color: '#1c1c1c', fontSize: 8 }}>▶</span>
          </Link>
        )}
      </div>

      {/* Desktop: horizontal */}
      <div className="relative mb-16 px-20 hidden md:block" style={{ height: 20 }}>
        <TakeMeElsewhere
          destinations={destinations}
          className="absolute left-1/2 -translate-x-1/2 top-0"
          style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase' }}
        />
        {nextProject && (
          <Link
            href={`/${nextProject.slug}`}
            className="absolute right-20 top-0 flex items-center gap-1.5 hover:opacity-60 transition-opacity"
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase' }}>
              Next project
            </span>
            <span style={{ color: '#1c1c1c', fontSize: 10 }}>▶</span>
          </Link>
        )}
      </div>
    </>
  )
}

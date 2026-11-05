import Link from 'next/link'
import TakeMeElsewhere from './TakeMeElsewhere'
import FooterBase from './FooterBase'

export type FooterLink = { href: string; label: string }

type Props = {
  destinations?: { slug: string }[]
  /** e.g. “Back to Open Rolls” */
  back?: FooterLink | null
  /** e.g. “Next story: Malnad Days” — only pass on pages where “next” makes sense */
  next?: FooterLink | null
}

export default function SiteFooter({ destinations = [], back, next }: Props) {
  return (
    <footer className="ew-foot">
      <nav className="ew-foot-nav" aria-label="More from Elsewhere">
        <span className="ew-foot-l">{back && <Link href={back.href} className="ew-muted-link">{back.label}</Link>}</span>
        <span className="ew-foot-c"><TakeMeElsewhere destinations={destinations} /></span>
        <span className="ew-foot-r">
          {next && (
            <Link href={next.href} className="ew-muted-link ew-next">
              {next.label}<span className="ew-tri" aria-hidden="true" />
            </Link>
          )}
        </span>
      </nav>
      <FooterBase />
    </footer>
  )
}

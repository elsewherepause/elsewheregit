'use client'

import { useRouter, usePathname } from 'next/navigation'

type Props = { destinations: { slug: string }[]; className?: string }

/** Sends the visitor to a random story, note or Open Rolls — anywhere but here. */
export default function TakeMeElsewhere({ destinations, className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const others = destinations.filter(d => `/${d.slug}` !== pathname)
  if (others.length === 0) return null
  return (
    <button
      type="button"
      onClick={() => router.push(`/${others[Math.floor(Math.random() * others.length)].slug}`)}
      className={`ew-muted-link ${className ?? ''}`}
    >
      Take me elsewhere
    </button>
  )
}

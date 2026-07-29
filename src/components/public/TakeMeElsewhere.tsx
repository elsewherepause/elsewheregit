'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type Props = {
  destinations: { slug: string }[]
  className?: string
  style?: React.CSSProperties
}

export default function TakeMeElsewhere({ destinations, className, style }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)

  function go() {
    const others = destinations.filter(d => `/${d.slug}` !== pathname)
    if (others.length === 0) return
    const pick = others[Math.floor(Math.random() * others.length)]
    router.push(`/${pick.slug}`)
  }

  return (
    <span
      onClick={go}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'color 0.2s',
        ...style,
        ...(hovered ? { color: '#000' } : null),
      }}
    >
      Take me elsewhere
    </span>
  )
}

import type { Metadata } from 'next'
import SiteNav from '@/components/public/nav/SiteNav'
import AboutCanvas from '@/components/public/about/AboutCanvas'

export const metadata: Metadata = {
  title: 'About Me',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <AboutCanvas />
    </>
  )
}

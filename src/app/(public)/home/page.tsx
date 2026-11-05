import type { Metadata } from 'next'
import SiteNav from '@/components/public/nav/SiteNav'
import HomeReveal from '@/components/public/home/HomeReveal'
import { getHomeStories } from '@/lib/story/home'
import { getAllDestinations } from '@/lib/utils/random-destination'

export const revalidate = 300
export const metadata: Metadata = { title: 'Stories', alternates: { canonical: '/home' } }

export default async function HomePage() {
  const [stories, destinations] = await Promise.all([
    getHomeStories().catch(err => { console.error('[home]', err); return [] }),
    getAllDestinations(),
  ])
  return (
    <>
      <SiteNav />
      <HomeReveal stories={stories} destinations={destinations} />
    </>
  )
}

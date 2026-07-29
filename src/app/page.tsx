import type { Metadata } from 'next'
import WelcomeIntro from '@/components/public/welcome/WelcomeIntro'

export const metadata: Metadata = {
  title: '.elsewhere',
}

export default function RootPage() {
  return <WelcomeIntro />
}

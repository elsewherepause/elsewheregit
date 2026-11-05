import type { Metadata } from 'next'
import { Montserrat, DM_Sans } from 'next/font/google'
import { MusicPlayerProvider } from '@/components/public/MusicPlayerProvider'
import GlobalMusicPlayer from '@/components/public/GlobalMusicPlayer'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-serif', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elsewhere.ink'),
  title: { default: '.elsewhere', template: '%s — .elsewhere' },
  description: 'Cultural + Narrative Design',
  icons: { icon: '/icon.jpeg', shortcut: '/icon.jpeg', apple: '/apple-icon.jpeg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`antialiased ${montserrat.variable} ${dmSans.variable}`}>
      <body>
        <MusicPlayerProvider>
          {children}
          <GlobalMusicPlayer />
        </MusicPlayerProvider>
      </body>
    </html>
  )
}

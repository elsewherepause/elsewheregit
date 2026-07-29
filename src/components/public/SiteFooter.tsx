import FooterNav from './FooterNav'
import FooterBase from './FooterBase'

type Props = {
  nextProject?: { slug: string; title: string } | null
  destinations?: { slug: string }[]
}

export default function SiteFooter({ nextProject, destinations = [] }: Props) {
  return (
    <footer className="pt-24 pb-10">
      <FooterNav nextProject={nextProject} destinations={destinations} />
      <FooterBase />
    </footer>
  )
}

import Image from 'next/image'
import { cloudinaryUrl } from '@/lib/utils/cloudinary-url'
import type { Project, MediaAsset } from '@prisma/client'

type Props = {
  project: Project & { heroImage: MediaAsset | null }
}

export default function ProjectHero({ project }: Props) {
  return (
    <header className="relative">
      {project.heroImage ? (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <Image
            src={cloudinaryUrl(project.heroImage.cloudinaryId, { width: 1920, crop: 'fill' })}
            alt={project.heroImage.altText ?? project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        </div>
      ) : (
        <div className="h-40 md:h-64 bg-[var(--color-paper-warm)]" />
      )}

      <div className="px-6 md:px-12 lg:px-20 pt-6 pb-12 md:pt-8 md:pb-16">
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight max-w-4xl"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}
        >
          {project.title}
        </h1>
        {project.description && (
          <p className="mt-6 text-base md:text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {project.description}
          </p>
        )}
        {project.publishedAt && (
          <p className="mt-4 text-xs uppercase tracking-widest text-[var(--color-ink-faint)]">
            {new Date(project.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </header>
  )
}

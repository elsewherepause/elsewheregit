'use client'

import SiteFooter from '@/components/public/SiteFooter'

type Props = {
  imageIds: string[]
  nextProject?: { slug: string; title: string } | null
  destinations?: { slug: string }[]
}

export default function CanvasPhotosView({ imageIds, nextProject, destinations = [] }: Props) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const filtered = imageIds.filter(Boolean)
  if (filtered.length === 0) return null

  return (
    <>
      <div className="px-6 py-6 md:px-[250px] md:py-[80px] md:pb-[100px]">
        {filtered.map((id, i) => {
          const url = cloudName
            ? `https://res.cloudinary.com/${cloudName}/image/upload/w_1600,c_limit,q_auto,f_auto/${id}`
            : ''
          return (
            <div
              key={`${id}-${i}`}
              style={{
                position: 'sticky',
                top: 60,
                zIndex: i,
                marginBottom: 60,
                height: 'calc(100vh - 120px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {url && (
                <img
                  src={url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      <SiteFooter nextProject={nextProject} destinations={destinations} />
    </>
  )
}

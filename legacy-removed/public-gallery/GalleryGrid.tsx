'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cloudinaryUrl, cloudinaryVideoUrl, cloudinaryVideoThumbnail } from '@/lib/utils/cloudinary-url'
import CroppedImage, { type ImageAdjust } from '@/components/shared/CroppedImage'
import type { GalleryMediaType } from '@prisma/client'
import type { Note } from '@/actions/note.actions'
import GalleryLightbox from './GalleryLightbox'

export type GalleryItemData = {
  id: string
  altText: string | null
  caption: string | null
  description: string | null
  mediaType: GalleryMediaType
  category: string | null
  imageAdjust?: ImageAdjust | null
  image: { cloudinaryId: string; width: number; height: number }
}

// Pulls the numeric aspect ratio out of a Tailwind class like "aspect-[288/395]".
function parseAspect(aspectClass: string): number {
  const m = aspectClass.match(/\[(\d+)\/(\d+)\]/)
  return m ? parseInt(m[1], 10) / parseInt(m[2], 10) : 1
}

function ArticleNote({ note, align = "left" }: { note?: Note; align?: "left" | "right" }) {
  if (note) {
    return (
      <div className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-1.5 ${align === "right" ? "flex-row-reverse" : ""}`}>
          <span className="font-sans text-sm md:text-base font-normal text-[var(--color-ink)]">Notes |</span>
          <span className="font-sans text-sm md:text-base font-normal text-[#848484] uppercase">{note.readTime || '2 min read'}</span>
        </div>
        <Link 
          href={`/notes/${note.slug}`}
          className={`font-heading text-xl md:text-[28px] font-medium uppercase underline underline-offset-2 leading-tight hover:opacity-75 transition-opacity ${align === "right" ? "text-right" : "text-left"}`}
        >
          {note.title}
        </Link>
      </div>
    )
  }

  // No note yet — render nothing until one is published in /admin/notes
  return null
}

function EditorialTitle({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <h2 className={`font-heading text-xl md:text-[28px] font-medium uppercase leading-tight ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </h2>
  )
}

function EditorialText({
  title,
  desc,
  align = "left",
}: {
  title?: string | null
  desc?: string | null
  align?: "left" | "right"
}) {
  if (!title && !desc) return null
  return (
    <div className={`flex flex-col gap-1 ${align === "right" ? "items-end" : "items-start"}`}>
      {title && <EditorialTitle align={align}>{title}</EditorialTitle>}
      {desc && (
        <p className={`font-sans text-sm md:text-base font-normal text-[var(--color-ink-muted)] leading-normal max-w-[360px] ${align === "right" ? "text-right" : "text-left"}`}>
          {desc}
        </p>
      )}
    </div>
  )
}

function renderImage(item: GalleryItemData, aspectClass: string, onOpen: (item: GalleryItemData) => void) {
  if (item.mediaType === 'VIDEO') {
    return (
      <div
        className={`relative w-full ${aspectClass} group cursor-pointer`}
        onClick={() => onOpen(item)}
      >
        <video
          src={cloudinaryVideoUrl(item.image.cloudinaryId, { quality: 'auto' })}
          poster={cloudinaryVideoThumbnail(item.image.cloudinaryId, { width: 1200 })}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <span className="absolute top-3 left-3 text-[11px] uppercase tracking-widest text-white bg-black/50 px-2 py-1 pointer-events-none">
          Video
        </span>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${aspectClass} cursor-pointer`}
      onClick={() => onOpen(item)}
    >
      <CroppedImage
        src={cloudinaryUrl(item.image.cloudinaryId, { width: 1400, crop: '' })}
        alt={item.altText || ''}
        adj={item.imageAdjust ?? undefined}
        aspect={parseAspect(aspectClass)}
      />
    </div>
  )
}

function GalleryGroup({
  groupItems,
  note1,
  note2,
  gIndex,
  onOpen,
}: {
  groupItems: GalleryItemData[]
  note1?: Note
  note2?: Note
  gIndex: number
  onOpen: (item: GalleryItemData) => void
}) {
  const flip = gIndex % 2 === 1
  const img0 = groupItems[0]
  const img1 = groupItems[1]
  const img2 = groupItems[2]
  const img3 = groupItems[3]
  const img4 = groupItems[4]
  const img5 = groupItems[5]
  const img6 = groupItems[6]
  const img7 = groupItems[7]

  return (
    <div className="space-y-20 md:space-y-24 lg:space-y-36">
      {/* Row 1: Article note + center portrait + text right */}
      {img0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-3 md:col-start-1 md:pt-4">
            <ArticleNote note={note1} align={flip ? 'right' : 'left'} />
          </div>
          <div className="col-span-12 md:col-span-3 md:col-start-5">
            {renderImage(img0, 'aspect-[274/376]', onOpen)}
          </div>
          <div className={`col-span-12 md:col-span-4 md:col-start-9 md:pt-10 ${flip ? 'md:col-start-1 md:row-start-1' : ''}`}>
            <EditorialText
              title={img0.caption}
              desc={img0.description}
              align={flip ? 'right' : 'left'}
            />
          </div>
        </div>
      )}

      {/* Row 2: image | text | text | image */}
      {(img1 || img2) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {img1 && (
            <div>
              {renderImage(img1, 'aspect-[288/395]', onOpen)}
            </div>
          )}
          {img1 && (
            <div className="md:self-end">
              <EditorialText title={img1.caption} desc={img1.description} align="left" />
            </div>
          )}
          <div className="order-2 md:order-none">
            {img2 && (
              <EditorialText title={img2.caption} desc={img2.description} align="right" />
            )}
          </div>
          {img2 && (
            <div className="order-1 md:order-none">
              {renderImage(img2, 'aspect-[288/395]', onOpen)}
            </div>
          )}
        </div>
      )}

      {/* Row 4: Caption left (adjacent) + landscape right */}
      {img3 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-3 md:col-start-4 order-2 md:order-none">
            <EditorialText title={img3.caption} desc={img3.description} align="right" />
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 order-1 md:order-none">
            {renderImage(img3, 'aspect-[520/298]', onOpen)}
          </div>
        </div>
      )}

      {/* Row 5: Landscape left + title+desc + article note right + portrait right */}
      {(img4 || img5) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {img4 && (
            <div className="col-span-12 md:col-span-5 md:col-start-1">
              {renderImage(img4, 'aspect-[520/298]', onOpen)}
            </div>
          )}
          <div className="col-span-12 md:col-span-3 md:col-start-6 md:pt-2">
            {img4 && (
              <EditorialText
                title={img4.caption}
                desc={img4.description}
                align="left"
              />
            )}
          </div>
          {img5 && (
            <div className="col-span-12 md:col-span-3 md:col-start-10">
              <ArticleNote note={note2} align="right" />
              <div className="mt-4">
                {renderImage(img5, 'aspect-[288/395]', onOpen)}
              </div>
              <div className="mt-4">
                <EditorialText
                  title={img5.caption}
                  desc={img5.description}
                  align="right"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 6: Text+landscape left, title right+landscape right */}
      {(img6 || img7) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {img6 && (
            <div className="col-span-12 md:col-span-5 md:col-start-1 flex flex-col gap-6">
              {renderImage(img6, 'aspect-[469/240]', onOpen)}
              <div className="flex justify-end">
                <EditorialText
                  title={img6.caption}
                  desc={img6.description}
                  align="right"
                />
              </div>
            </div>
          )}
          {img7 && (
            <div className="col-span-12 md:col-span-5 md:col-start-8 md:mt-20">
              {img7.caption && (
                <div className="hidden md:block">
                  <EditorialTitle align="left">{img7.caption}</EditorialTitle>
                </div>
              )}
              <div className="mt-4">
                {renderImage(img7, 'aspect-[520/298]', onOpen)}
              </div>
              {img7.description && (
                <div className="mt-4 flex justify-end">
                  <EditorialText
                    title={img7.caption}
                    desc={img7.description}
                    align="right"
                  />
                </div>
              )}
              {!img7.description && img7.caption && (
                <div className="mt-4 flex justify-end md:hidden">
                  <EditorialText title={img7.caption} align="right" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function GalleryGrid({ items, notes = [] }: { items: GalleryItemData[]; notes?: Note[] }) {
  const [lightboxItem, setLightboxItem] = useState<GalleryItemData | null>(null)

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-[var(--color-ink-faint)] tracking-widest uppercase">No images yet</p>
      </div>
    )
  }

  // Chunk items into groups of 8
  const groups: GalleryItemData[][] = []
  for (let i = 0; i < items.length; i += 8) {
    groups.push(items.slice(i, i + 8))
  }

  return (
    <>
      <div className="space-y-24 md:space-y-36 lg:space-y-48 pb-24">
        {groups.map((groupItems, gIndex) => {
          const note1 = notes[gIndex * 2]
          const note2 = notes[gIndex * 2 + 1]
          return (
            <GalleryGroup
              key={gIndex}
              groupItems={groupItems}
              note1={note1}
              note2={note2}
              gIndex={gIndex}
              onOpen={setLightboxItem}
            />
          )
        })}
      </div>

      {lightboxItem && (
        <GalleryLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}
    </>
  )
}

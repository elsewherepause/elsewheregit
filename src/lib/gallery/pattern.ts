// Gallery pattern engine
//
// The Figma gallery design ("Gallery", node 507:384) is a tall, asymmetric
// scatter of image tiles paired with caption text blocks that alternate
// between left/right alignment and side/below caption placement. Rather than
// hardcode absolute positions for a fixed set of images, we encode that
// rhythm as a repeating sequence of row templates. Admin-managed gallery
// images are mapped onto this sequence in order and the pattern repeats once
// the images run out.

export type GallerySlot = {
  /** grid placement classes for the image cell */
  imageClass: string
  /** aspect ratio class for the image */
  aspect: string
  /** caption placement relative to the image */
  captionPosition: 'side' | 'below'
  /** grid placement classes for the caption cell (only used when captionPosition === 'side') */
  captionClass?: string
  /** text alignment for the caption */
  captionAlign: 'left' | 'right'
  /** render the caption before the image in source order (controls mobile stacking) */
  captionFirst?: boolean
}

export const GALLERY_PATTERN: GallerySlot[] = [
  // Centered portrait, caption to the right
  {
    imageClass: 'md:col-start-4 md:col-span-4',
    aspect: 'aspect-[274/376]',
    captionPosition: 'side',
    captionClass: 'md:col-start-8 md:col-span-4 md:self-center',
    captionAlign: 'left',
  },
  // Right-side portrait, caption to the left (right-aligned text)
  {
    imageClass: 'md:col-start-7 md:col-span-5',
    aspect: 'aspect-[288/395]',
    captionPosition: 'side',
    captionClass: 'md:col-start-1 md:col-span-5 md:self-center',
    captionAlign: 'right',
    captionFirst: true,
  },
  // Left medium portrait, caption stacked below
  {
    imageClass: 'md:col-start-1 md:col-span-4',
    aspect: 'aspect-[216/296]',
    captionPosition: 'below',
    captionAlign: 'left',
  },
  // Right wide landscape, caption stacked below (right-aligned)
  {
    imageClass: 'md:col-start-6 md:col-span-7',
    aspect: 'aspect-[520/298]',
    captionPosition: 'below',
    captionAlign: 'right',
  },
  // Left wide landscape, caption stacked below
  {
    imageClass: 'md:col-start-1 md:col-span-7',
    aspect: 'aspect-[520/298]',
    captionPosition: 'below',
    captionAlign: 'left',
  },
  // Large right portrait, caption far left (right-aligned text)
  {
    imageClass: 'md:col-start-7 md:col-span-6',
    aspect: 'aspect-[288/395]',
    captionPosition: 'side',
    captionClass: 'md:col-start-1 md:col-span-5 md:self-center',
    captionAlign: 'right',
    captionFirst: true,
  },
  // Center-wide landscape, caption stacked below (right-aligned)
  {
    imageClass: 'md:col-start-2 md:col-span-10',
    aspect: 'aspect-[520/390]',
    captionPosition: 'below',
    captionAlign: 'right',
  },
  // Left landscape, caption to the right (right-aligned text)
  {
    imageClass: 'md:col-start-1 md:col-span-6',
    aspect: 'aspect-[469/240]',
    captionPosition: 'side',
    captionClass: 'md:col-start-8 md:col-span-5 md:self-center',
    captionAlign: 'right',
  },
]

export function getGallerySlot(index: number): GallerySlot {
  return GALLERY_PATTERN[index % GALLERY_PATTERN.length]
}

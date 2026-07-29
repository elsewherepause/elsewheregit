import type { Pattern } from '@/components/admin/template-editor/shared'

export const PATTERNS: Pattern[] = [
  {
    desc: 'Image left, text right',
    images: [{ field: 'image1', label: 'Image — left (648x416)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'quote', label: 'Body intro', multiline: true },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
    ],
  },
  {
    desc: 'Image right, text left',
    images: [
      { field: 'image1', label: 'Landscape — right (560x480)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
  {
    desc: 'Full image, text below right',
    images: [
      { field: 'image1', label: 'Full image (900x500)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
  {
    desc: 'Portraits, soil text',
    images: [
      { field: 'image1', label: 'Tall portrait left (520x620)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'quote', label: 'Body intro', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
  {
    desc: 'Two headlines + portrait',
    images: [
      { field: 'image2', label: 'Portrait right (685x589)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'quote', label: 'Body intro', multiline: true },
      { field: 'body3', label: 'Body 3 — left column', multiline: true },
      { field: 'body4', label: 'Body 4 — right column', multiline: true },
    ],
  },
  {
    desc: 'Image left, text right + 3-column body below',
    images: [
      { field: 'image1', label: 'Image — left (560x480)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'quote', label: 'Body intro', multiline: true },
      { field: 'body2', label: 'Body 1 — left column', multiline: true },
      { field: 'body3', label: 'Body 2 — center column', multiline: true },
      { field: 'body4', label: 'Body 3 — right column', multiline: true },
    ],
  },
  {
    desc: 'Image right, text left (2-column)',
    images: [
      { field: 'image1', label: 'Image — right (680x450)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
]

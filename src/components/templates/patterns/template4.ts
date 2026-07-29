import type { Pattern } from '@/components/admin/template-editor/shared'

export const PATTERNS: Pattern[] = [
  {
    desc: 'Landscape image with headline',
    images: [{ field: 'image1', label: 'Image (648x416)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
  {
    desc: 'Three images with body text',
    images: [
      { field: 'image1', label: 'Main image (695x492)' },
      { field: 'image2', label: 'Lower left (487x575)' },
      { field: 'image3', label: 'Right portrait (223x115)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
    ],
  },
  {
    desc: 'Landscape with quote',
    images: [
      { field: 'image1', label: 'Image (684x520)' },
      { field: 'image2', label: 'Second Image (400x300)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body — left column', multiline: true },
      { field: 'body3', label: 'Body — right column', multiline: true },
      { field: 'body5', label: 'Body — below image', multiline: true },
    ],
  },
  {
    desc: 'Two portraits with quote',
    images: [
      { field: 'image1', label: 'Top left (460x420)' },
      { field: 'image2', label: 'Middle right (350x250)' },
      { field: 'image3', label: 'Bottom left (460x250)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
      { field: 'body3', label: 'Body 3 — bottom right', multiline: true },
    ],
  },
  {
    desc: 'Image left + 2-column text + image right',
    images: [
      { field: 'image1', label: 'Image — left (300x550)' },
      { field: 'image2', label: 'Image — right (340x550)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
  {
    desc: 'Image left + text right + image below',
    images: [
      { field: 'image1', label: 'Image — top left (450x400)' },
      { field: 'image2', label: 'Image — bottom center (500x280)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
  {
    desc: 'Image left, text right',
    images: [
      { field: 'image1', label: 'Image — left (530x380)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
  {
    desc: '3 images + text blocks',
    images: [
      { field: 'image1', label: 'Image — top right (680x350)' },
      { field: 'image2', label: 'Image — left portrait (250x350)' },
      { field: 'image3', label: 'Image — bottom center (500x300)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
      { field: 'body3', label: 'Body 3 — right of portrait', multiline: true },
      { field: 'body4', label: 'Body 4 — right of bottom image', multiline: true },
    ],
  },
  {
    desc: 'Image left + text right + image below',
    images: [
      { field: 'image1', label: 'Image — left (400x500)' },
      { field: 'image2', label: 'Image — below right column (300x250)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
      { field: 'body3', label: 'Body 3 — right of bottom image', multiline: true },
    ],
  },
  {
    desc: 'Portrait left + text right + landscape below',
    images: [
      { field: 'image1', label: 'Image — left portrait (400x550)' },
      { field: 'image2', label: 'Image — bottom right (500x300)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1 — left column', multiline: true },
      { field: 'body2', label: 'Body 2 — right column', multiline: true },
    ],
  },
]

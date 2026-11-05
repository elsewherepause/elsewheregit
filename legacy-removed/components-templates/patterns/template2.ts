import type { Pattern } from '@/components/admin/template-editor/shared'

export const PATTERNS: Pattern[] = [
  {
    desc: 'Image left, text right',
    images: [{ field: 'image1', label: 'Image — left (648x416)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body3', label: 'Body 2', multiline: true },
    ],
  },
  {
    desc: 'Images + text columns',
    images: [
      { field: 'image1', label: 'Main image (695x492)' },
      { field: 'image2', label: 'Lower left (487x575)' },
      { field: 'image3', label: 'Right portrait (193x354)' },
      { field: 'image4', label: 'Lower right (193x354)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
    ],
  },
  {
    desc: 'Wide image, text left',
    images: [{ field: 'image1', label: 'Image — wide (684x520)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
    ],
  },
  {
    desc: 'Image left, text right',
    images: [{ field: 'image1', label: 'Image — left (499x616)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
      { field: 'body3', label: 'Body 3', multiline: true },
      { field: 'body4', label: 'Body 4', multiline: true },
    ],
  },
  {
    desc: 'Large image right, text left',
    images: [
      { field: 'image1', label: 'Image — large right (685x589)' },
      { field: 'image2', label: 'Image 2 — lower left (469x334)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
    ],
  },
  {
    desc: 'Portrait + strip image',
    images: [
      { field: 'image1', label: 'Portrait (293x456)' },
      { field: 'image2', label: 'Small portrait (293x262)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body', multiline: true },
    ],
  },
  {
    desc: 'Landscape strip + headline',
    images: [{ field: 'image1', label: 'Landscape strip (469x178)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body 1', multiline: true },
      { field: 'body2', label: 'Body 2', multiline: true },
    ],
  },
  {
    desc: 'Large landscape + 3 body blocks',
    images: [{ field: 'image1', label: 'Landscape — left (688x589)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body — left column', multiline: true },
      { field: 'body3', label: 'Body — right column', multiline: true },
    ],
  },
]

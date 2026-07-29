import type { Pattern } from '@/components/admin/template-editor/shared'

export const PATTERNS: Pattern[] = [
  {
    desc: 'Large landscape + 2-column text',
    images: [{ field: 'image1', label: 'Main image (691x520)' }],
    texts: [

      { field: 'headline', label: 'Headline (bold, uppercase)', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Landscape strip + small portrait + tall portrait + small portrait + text',
    images: [
      { field: 'image1', label: 'Landscape strip (469x311)' },
      { field: 'image2', label: 'Small portrait — right (193x354)' },
      { field: 'image3', label: 'Tall portrait — left (494x575)' },
      { field: 'image4', label: 'Small portrait — right (193x354)' },
    ],
    texts: [




      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — above', multiline: true },
      { field: 'body3', label: 'Body text — right of upper portrait', multiline: true },
      { field: 'body2', label: 'Body text — between portraits', multiline: true },
    ],
  },
  {
    desc: 'Large landscape — lower right + headline + 2-column text',
    images: [
      { field: 'image1', label: 'Large landscape — lower right (684x520)' },
    ],
    texts: [

      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Portrait + headline + 2-column body',
    images: [{ field: 'image1', label: 'Portrait — left (499x554)' }],
    texts: [

      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Tall portrait + small portrait + side text',
    images: [
      { field: 'image1', label: 'Tall portrait — left (478x575)' },
      { field: 'image2', label: 'Small portrait — right (193x354)' },
    ],
    texts: [


      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Large landscape right + headline + 2-column body + landscape below',
    images: [
      { field: 'image1', label: 'Large landscape — right (694x589)' },
      { field: 'image2', label: 'Landscape — below left (469x334)' },
    ],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
      { field: 'body3', label: 'Body text — right of bottom image', multiline: true },
    ],
  },
  {
    desc: 'Tall portrait + strip + text',
    images: [
      { field: 'image1', label: 'Tall portrait — far right (293x456)' },
      { field: 'image2', label: 'Bottom landscape strip — left (469x178)' },
    ],
    texts: [



      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text', multiline: true },
    ],
  },
  {
    desc: 'Small portrait right + headline + 2 body blocks',
    images: [{ field: 'image1', label: 'Small portrait — far right (293x262)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Large landscape + text panel (headline + 2 blocks)',
    images: [{ field: 'image1', label: 'Large landscape — left (688x589)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Portrait + text panel (headline + 2 blocks)',
    images: [{ field: 'image1', label: 'Portrait — left (484x575)' }],
    texts: [
      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
  {
    desc: 'Narrow portrait + headline + 2-column text',
    images: [{ field: 'image1', label: 'Narrow portrait — center (227x487)' }],
    texts: [

      { field: 'headline', label: 'Headline', multiline: true },
      { field: 'body1', label: 'Body text — left column', multiline: true },
      { field: 'body2', label: 'Body text — right column', multiline: true },
    ],
  },
]

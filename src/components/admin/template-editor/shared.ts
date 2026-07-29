export type ImageAdjust = { x: number; y: number; zoom: number }

export const DEFAULT_ADJUST: ImageAdjust = { x: 50, y: 50, zoom: 1 }

export type Section = {
  image1?: string
  image1Adjust?: ImageAdjust
  image2?: string
  image2Adjust?: ImageAdjust
  image3?: string
  image3Adjust?: ImageAdjust
  image4?: string
  image4Adjust?: ImageAdjust
  caption1?: string
  caption2?: string
  caption3?: string
  caption4?: string
  headline?: string
  headline2?: string
  body1?: string
  body2?: string
  body3?: string
  body4?: string
  body5?: string
  body6?: string
  quote?: string
  quote2?: string
}

export type TemplateData = {
  titleBold?: string
  location?: string
  coordinates?: string
  camera?: string
  heroImage?: string
  heroImageAdjust?: ImageAdjust
  homepageHeroAdjust?: ImageAdjust
  sections: Section[]
  nextProjectTitle?: string
  nextProjectSlug?: string
  podcastSpotifyUrls?: string[]
}

export type Pattern = {
  desc: string
  images: { field: keyof Section; label: string }[]
  texts: { field: keyof Section; label: string; multiline: boolean }[]
}

export function hasContent(s?: Partial<Section>): boolean {
  if (!s) return false
  return Object.values(s).some(v => typeof v === 'string' && v.trim() !== '')
}

export const inputCls =
  'w-full border-b border-gray-200 py-1.5 text-sm bg-transparent focus:outline-none focus:border-black transition-colors placeholder:text-gray-300'

export const textareaCls =
  `${inputCls} resize-none border border-gray-200 p-2 rounded h-24 border-b`

export type ImageRef = {
  cloudinaryId: string
  altText?: string
  width?: number
  height?: number
}

export type IntroBlockPayload = {
  title: string
  subtitle?: string
  description?: string
}

export type RichTextBlockPayload = {
  heading?: string
  html: string
}

export type FullWidthImageBlockPayload = {
  image: ImageRef
  caption?: string
}

export type ImageTextBlockPayload = {
  image: ImageRef
  heading?: string
  content: string
  imagePosition: 'left' | 'right'
}

export type PortraitImageBlockPayload = {
  image: ImageRef
  caption?: string
}

export type LandscapeImageBlockPayload = {
  image: ImageRef
  caption?: string
}

export type GalleryBlockPayload = {
  images: ImageRef[]
  layout: 2 | 3 | 4
}

export type QuoteBlockPayload = {
  quote: string
  attribution?: string
}

export type DividerBlockPayload = Record<string, never>

export type SpacerBlockPayload = {
  heightRem: number
}

export type BaseLayoutOptions = {
  watermark?: string
  align?: 'left' | 'center' | 'right'
  marginLeft?: string
  marginTop?: string
}

export type BlockPayload = (
  | ({ type: 'INTRO' } & IntroBlockPayload)
  | ({ type: 'RICH_TEXT' } & RichTextBlockPayload)
  | ({ type: 'FULL_WIDTH_IMAGE' } & FullWidthImageBlockPayload)
  | ({ type: 'IMAGE_TEXT' } & ImageTextBlockPayload)
  | ({ type: 'PORTRAIT_IMAGE' } & PortraitImageBlockPayload)
  | ({ type: 'LANDSCAPE_IMAGE' } & LandscapeImageBlockPayload)
  | ({ type: 'GALLERY' } & GalleryBlockPayload)
  | ({ type: 'QUOTE' } & QuoteBlockPayload)
  | ({ type: 'DIVIDER' } & DividerBlockPayload)
  | ({ type: 'SPACER' } & SpacerBlockPayload)
) & { layoutOptions?: BaseLayoutOptions }

export type BlockType = BlockPayload['type']

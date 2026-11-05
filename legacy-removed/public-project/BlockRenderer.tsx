import type { ContentBlock } from '@prisma/client'
import type { BlockPayload } from '@/lib/types/blocks'
import IntroBlock from './blocks/IntroBlock'
import RichTextBlock from './blocks/RichTextBlock'
import FullWidthImageBlock from './blocks/FullWidthImageBlock'
import ImageTextBlock from './blocks/ImageTextBlock'
import PortraitImageBlock from './blocks/PortraitImageBlock'
import LandscapeImageBlock from './blocks/LandscapeImageBlock'
import GalleryBlock from './blocks/GalleryBlock'
import QuoteBlock from './blocks/QuoteBlock'
import DividerBlock from './blocks/DividerBlock'
import SpacerBlock from './blocks/SpacerBlock'

type Props = {
  block: ContentBlock & { payload: BlockPayload }
}

export default function BlockRenderer({ block }: Props) {
  const { payload } = block
  const renderBlock = () => {
    switch (payload.type) {
      case 'INTRO':           return <IntroBlock payload={payload as any} />
      case 'RICH_TEXT':       return <RichTextBlock payload={payload as any} />
      case 'FULL_WIDTH_IMAGE':return <FullWidthImageBlock payload={payload as any} />
      case 'IMAGE_TEXT':      return <ImageTextBlock payload={payload as any} />
      case 'PORTRAIT_IMAGE':  return <PortraitImageBlock payload={payload as any} />
      case 'LANDSCAPE_IMAGE': return <LandscapeImageBlock payload={payload as any} />
      case 'GALLERY':         return <GalleryBlock payload={payload as any} />
      case 'QUOTE':           return <QuoteBlock payload={payload as any} />
      case 'DIVIDER':         return <DividerBlock />
      case 'SPACER':          return <SpacerBlock payload={payload as any} />
      default:                return null
    }
  }

  const { layoutOptions } = payload
  if (!layoutOptions) return renderBlock()

  return (
    <div className="relative w-full" style={{ 
      marginTop: layoutOptions.marginTop, 
      marginLeft: layoutOptions.marginLeft,
      display: 'flex',
      justifyContent: layoutOptions.align === 'right' ? 'flex-end' : layoutOptions.align === 'left' ? 'flex-start' : 'center'
    }}>
      {layoutOptions.watermark && (
        <div className="absolute top-0 right-10 text-[200px] text-gray-100 font-bold -z-10 pointer-events-none select-none opacity-50 tracking-tighter" style={{ fontFamily: 'var(--font-heading)' }}>
          {layoutOptions.watermark}
        </div>
      )}
      {renderBlock()}
    </div>
  )
}

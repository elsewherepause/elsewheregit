type Props = {
  rowClassName?: string
  rowStyle?: React.CSSProperties
  wordmarkHeight?: number
  // Multiplies the icon size / copyright font size, and the row margin/padding
  // below, to a fixed (non-responsive) value. Only pass this when this component
  // renders outside any ancestor `transform: scale()` and needs the canvas scale
  // factor applied manually (see CanvasFooter). Leave unset everywhere else —
  // the row falls back to the same responsive mobile/desktop spacing the About
  // page uses (px-5/mt-6/pb-8 on mobile, px-[88px]/mt-12/pb-10 from md up).
  scale?: number
  // Overrides the default bottom padding. Only needed alongside `scale`.
  paddingBottom?: number
}

export default function FooterBase({ rowClassName, rowStyle, wordmarkHeight, scale, paddingBottom }: Props) {
  const scaled = scale !== undefined
  return (
    <div
      className={scaled ? undefined : 'pb-8 md:pb-10'}
      style={scaled ? { paddingBottom: paddingBottom ?? 40 * scale } : undefined}
    >
      <img
        src="/t1-wordmark.svg"
        alt=".elsewhere"
        style={{ width: '88%', display: 'block', margin: '0 auto', ...(wordmarkHeight ? { height: wordmarkHeight } : {}) }}
      />
      <div
        className={[
          'flex items-center justify-between',
          scaled ? '' : 'mt-6 px-5 md:mt-12 md:px-[88px]',
          rowClassName ?? '',
        ].filter(Boolean).join(' ')}
        style={{
          ...(scaled ? { marginTop: 48 * scale, paddingLeft: 88 * scale, paddingRight: 88 * scale } : {}),
          ...rowStyle,
        }}
      >
        <div style={{ display: 'flex', gap: 40 * (scale ?? 1), alignItems: 'center' }}>
          <a href="https://instagram.com/pause.elsewhere" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src="/t1-instagram.svg" alt="Instagram" width={20 * (scale ?? 1)} height={20 * (scale ?? 1)} style={{ display: 'block' }} />
          </a>
        </div>
        <span style={{ fontFamily: 'var(--font-sans, Montserrat)', fontWeight: 400, fontSize: 16 * (scale ?? 1), color: '#000' }}>
          @Copyright
        </span>
      </div>
    </div>
  )
}

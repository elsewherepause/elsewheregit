/**
 * The big .elsewhere wordmark and the Instagram / copyright row.
 * The right side of the row is left empty on purpose: the music player docks there.
 * The wordmark is capped at 26% of the screen height so short pages fit without a scrollbar.
 */
export default function FooterBase() {
  return (
    <div className="ew-foot-base">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/t1-wordmark.svg" alt=".elsewhere" className="ew-wordmark" />
      <div className="ew-foot-row">
        <a href="https://instagram.com/pause.elsewhere" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/t1-instagram.svg" alt="" width={20} height={20} />
        </a>
        <span>© {new Date().getFullYear()} Elsewhere</span>
      </div>
    </div>
  )
}

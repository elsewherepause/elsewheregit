'use client'

/** Shown instead of a blank crash if an admin page fails to load. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-10 max-w-lg">
      <h1 className="text-xl font-medium mb-3" style={{ fontFamily: 'var(--font-heading)' }}>This page didn’t load</h1>
      <p className="text-sm text-[#505050] leading-relaxed mb-5">
        Something went wrong on the server. Nothing you saved has been lost. Try again; if it keeps happening, the details are in the Vercel logs{error.digest ? ` (reference ${error.digest})` : ''}.
      </p>
      <button type="button" onClick={reset} className="px-4 py-2 bg-black text-white text-xs font-semibold">Try again</button>
    </div>
  )
}

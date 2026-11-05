'use client'

import { useRef, useState } from 'react'
import type { MediaAsset } from '@prisma/client'
import { saveMediaAsset } from '@/actions/media.actions'
import { IMAGE_LIMIT, VIDEO_LIMIT, isVideoFile, prepareImage } from '@/lib/upload/prepare-image'
import { SESSION_EXPIRED } from '@/lib/messages'

type Props = {
  onUploaded?: (assets: MediaAsset[]) => void
  accept?: 'image' | 'any'
  /** Big drop area instead of a button */
  zone?: boolean
  label?: string
}

type Problem = { file: string; reason: string }
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`

async function uploadOne(file: File): Promise<{ asset?: MediaAsset; problem?: string; note?: string }> {
  const video = isVideoFile(file)
  let note: string | undefined
  if (!video) {
    const prepared = await prepareImage(file)
    file = prepared.file
    note = prepared.note
    if (file.size > IMAGE_LIMIT) return { problem: `It’s ${mb(file.size)} and the limit for photos is 10 MB. Export it smaller (JPEG at full size is usually fine) and try again.` }
  } else if (file.size > VIDEO_LIMIT) {
    return { problem: `It’s ${mb(file.size)} and the limit for videos is 100 MB. Export a shorter or smaller version.` }
  }

  let sig: Response
  try {
    sig = await fetch('/api/cloudinary/sign', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: video ? 'elsewhere/videos' : 'elsewhere/photos' }),
    })
  } catch {
    return { problem: 'Couldn’t reach the site. Check your internet connection and try again.' }
  }
  if (sig.status === 401) return { problem: SESSION_EXPIRED }
  if (!sig.ok) return { problem: 'The site isn’t set up to upload right now (Cloudinary settings are missing on the server).' }
  const { signature, timestamp, folder, cloudName, apiKey } = await sig.json()

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  let data: { error?: { message?: string }; public_id: string; secure_url: string; format: string; width?: number; height?: number; bytes: number }
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${video ? 'video' : 'image'}/upload`, { method: 'POST', body: form })
    data = await res.json()
  } catch {
    return { problem: 'The upload was interrupted. Check your connection and try again.' }
  }
  if (data.error) {
    const msg = data.error.message ?? ''
    if (/file size too large/i.test(msg)) return { problem: 'Cloudinary says the file is too large for your plan.' }
    if (/invalid image|unsupported/i.test(msg)) return { problem: 'Cloudinary couldn’t read this file. Try saving it as JPEG or PNG.' }
    return { problem: `Cloudinary refused it: ${msg || 'unknown reason'}.` }
  }
  const saved = await saveMediaAsset({
    cloudinaryId: data.public_id,
    cloudinaryUrl: data.secure_url,
    format: data.format ?? file.name.split('.').pop() ?? 'jpg',
    width: data.width ?? 0,
    height: data.height ?? 0,
    bytes: data.bytes ?? file.size,
  })
  if (!saved.ok) return { problem: saved.error }
  return { asset: saved.data, note }
}

export default function MediaUploader({ onUploaded, accept = 'any', zone, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [over, setOver] = useState(false)

  async function handle(files: File[]) {
    const list = files.filter(f => accept === 'any' || !isVideoFile(f))
    if (!list.length) return
    setProblems([]); setNotes([])
    setBusy({ done: 0, total: list.length })
    const ok: MediaAsset[] = []
    const bad: Problem[] = []
    const info: string[] = []
    for (let i = 0; i < list.length; i++) {
      try {
        const r = await uploadOne(list[i])
        if (r.asset) ok.push(r.asset)
        if (r.note) info.push(r.note)
        if (r.problem) bad.push({ file: list[i].name, reason: r.problem })
      } catch (err) {
        console.error('[upload]', err)
        bad.push({ file: list[i].name, reason: 'Something unexpected went wrong with this file. Try it again.' })
      }
      setBusy({ done: i + 1, total: list.length })
    }
    setBusy(null)
    setProblems(bad)
    setNotes(info)
    if (inputRef.current) inputRef.current.value = ''
    if (ok.length) onUploaded?.(ok)
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept === 'image' ? 'image/*' : 'image/*,video/*'}
      multiple
      className="sr-only"
      onChange={e => e.target.files && handle(Array.from(e.target.files))}
    />
  )
  const status = busy ? `Uploading ${busy.done + 1 > busy.total ? busy.total : busy.done + 1} of ${busy.total}…` : null

  return (
    <div>
      {zone ? (
        <label
          onDragOver={e => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); handle(Array.from(e.dataTransfer.files)) }}
          className={`block border-[1.5px] border-dashed px-4 py-5 text-center text-xs cursor-pointer transition-colors ${over ? 'border-black bg-white' : 'border-[#c8c8c6] bg-[#fafafa] hover:border-black'} ${busy ? 'pointer-events-none opacity-60' : ''}`}
        >
          {input}
          <span className="block text-[#505050]">{status ?? <>Drop {accept === 'image' ? 'photos' : 'photos or videos'} here or <u>browse</u></>}</span>
          {!busy && <span className="block mt-1 text-[11px] text-[#767676]">Big camera files are shrunk automatically</span>}
        </label>
      ) : (
        <label className={`inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold tracking-wide cursor-pointer hover:bg-[#333] transition-colors ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
          {input}
          {status ?? label ?? 'Upload'}
        </label>
      )}
      {problems.length > 0 && (
        <div role="alert" className="mt-2 border border-[#f0c9bd] bg-[#fdf1ed] text-[#a33a1a] px-3 py-2 text-xs leading-relaxed">
          {problems.map((p, i) => <p key={i} className={i ? 'mt-1.5' : ''}><b>{p.file} didn’t upload.</b> {p.reason}</p>)}
          <button type="button" className="mt-1.5 underline" onClick={() => setProblems([])}>Dismiss</button>
        </div>
      )}
      {notes.length > 0 && (
        <div role="status" className="mt-2 text-[11px] text-[#505050]">{notes.map((n, i) => <p key={i}>{n}</p>)}</div>
      )}
    </div>
  )
}

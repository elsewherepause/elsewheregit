'use client'

import { useRef, useState } from 'react'
import { saveMediaAsset } from '@/actions/media.actions'

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'avi', 'mkv', 'ogv'])

function isVideoFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return file.type.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)
}

type Props = { onUploaded?: (asset: { id: string; cloudinaryId: string }) => void }

export default function MediaUploader({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  async function handleFiles(files: FileList) {
    setUploading(true)
    setProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isVideo = isVideoFile(file)
      const resourceType = isVideo ? 'video' : 'image'
      const folder = isVideo ? 'elsewhere/videos' : 'elsewhere/photos'
      // Convert every uploaded image to webp at upload time; videos are left as-is.
      const format = isVideo ? undefined : 'webp'

      const sigRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, format }),
      })
      const { signature, timestamp, folder: signedFolder, format: signedFormat, cloudName, apiKey } = await sigRes.json()

      const form = new FormData()
      form.append('file', file)
      form.append('api_key', apiKey)
      form.append('timestamp', String(timestamp))
      form.append('signature', signature)
      form.append('folder', signedFolder)
      if (signedFormat) form.append('format', signedFormat)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body: form }
      )
      const data = await uploadRes.json()

      if (data.error) {
        console.error('Cloudinary upload error:', data.error)
        continue
      }

      const asset = await saveMediaAsset({
        cloudinaryId: data.public_id,
        cloudinaryUrl: data.secure_url,
        format: data.format,
        width: data.width ?? 0,
        height: data.height ?? 0,
        bytes: data.bytes,
      })

      onUploaded?.(asset)
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setUploading(false)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        id="media-upload"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <label
        htmlFor="media-upload"
        className={`inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {uploading ? `Uploading… ${progress}%` : 'Upload'}
      </label>
      <span className="text-[10px] text-[var(--color-ink-muted)] ml-2">Max 10 MB</span>
    </div>
  )
}

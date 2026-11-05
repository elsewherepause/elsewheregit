/**
 * Runs in the browser before upload. Cloudinary’s current plan rejects images over
 * 10 MB, and camera files are often 15–30 MB, so big images are re-encoded here at
 * high quality (longest side 5000px) instead of failing.
 */
export const IMAGE_LIMIT = 10 * 1024 * 1024
export const VIDEO_LIMIT = 100 * 1024 * 1024
const SAFE_IMAGE = 9.5 * 1024 * 1024
const MAX_SIDE = 5000

export async function prepareImage(file: File): Promise<{ file: File; note?: string }> {
  if (file.size <= SAFE_IMAGE) return { file }
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    // e.g. HEIC on browsers that can’t decode it — let the caller report the size problem.
    return { file }
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return { file }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  for (const q of [0.92, 0.86, 0.8, 0.72]) {
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', q))
    if (blob && blob.size <= SAFE_IMAGE) {
      const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
      const mb = (n: number) => (n / 1024 / 1024).toFixed(1)
      return { file: new File([blob], name, { type: 'image/jpeg' }), note: `${file.name} was ${mb(file.size)} MB, so it was saved at ${mb(blob.size)} MB.` }
    }
  }
  return { file }
}

export function isVideoFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return file.type.startsWith('video/') || ['mp4', 'mov', 'webm', 'avi', 'mkv', 'ogv', 'm4v'].includes(ext)
}

export const VIDEO_FORMATS = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'ogv', 'm4v']

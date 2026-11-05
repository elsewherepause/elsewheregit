const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

type Transform = {
  width?: number
  height?: number
  crop?: string
  quality?: string
  format?: string
  aspectRatio?: string
  resourceType?: 'image' | 'video'
}

export function cloudinaryUrl(publicId: string, t: Transform = {}): string {
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto', aspectRatio, resourceType = 'image' } = t
  const parts: string[] = [`f_${format}`, `q_${quality}`]
  if (crop) parts.push(`c_${crop}`)
  if (width) parts.push(`w_${width}`)
  if (height) parts.push(`h_${height}`)
  if (aspectRatio) parts.push(`ar_${aspectRatio}`)
  return `https://res.cloudinary.com/${CLOUD}/${resourceType}/upload/${parts.join(',')}/${publicId}`
}

export function cloudinaryVideoUrl(publicId: string, t: Omit<Transform, 'resourceType'> = {}): string {
  return cloudinaryUrl(publicId, { ...t, resourceType: 'video' })
}

export function cloudinaryBlur(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_40,q_auto,f_auto,e_blur:400/${publicId}`
}

export function cloudinaryVideoThumbnail(publicId: string, t: Omit<Transform, 'resourceType' | 'format'> = {}): string {
  const { width, height, crop = 'fill', quality = 'auto' } = t
  const parts: string[] = ['f_jpg', `q_${quality}`]
  if (crop) parts.push(`c_${crop}`)
  if (width) parts.push(`w_${width}`)
  if (height) parts.push(`h_${height}`)
  return `https://res.cloudinary.com/${CLOUD}/video/upload/${parts.join(',')}/${publicId}.jpg`
}

/** Uncropped, resized image at the given width. */
export function photoUrl(publicId: string, width: number): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`
}

const WIDTHS = [480, 800, 1200, 1600, 2200]
/** srcset so phones download small files and big screens get sharp ones. */
export function photoSrcSet(publicId: string): string {
  return WIDTHS.map(w => `${photoUrl(publicId, w)} ${w}w`).join(', ')
}

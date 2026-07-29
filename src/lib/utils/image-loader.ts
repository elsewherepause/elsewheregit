type ImageLoaderProps = {
  src: string
  width: number
  quality?: number
}

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  // If the src is already a full Cloudinary URL, return as-is (we build transformations manually)
  if (src.startsWith('https://res.cloudinary.com')) return src
  // Fallback for local images
  return src
}

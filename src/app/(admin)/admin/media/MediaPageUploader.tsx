'use client'

import { useRouter } from 'next/navigation'
import MediaUploader from '@/components/admin/media/MediaUploader'

export default function MediaPageUploader() {
  const router = useRouter()
  return <MediaUploader zone onUploaded={() => router.refresh()} />
}

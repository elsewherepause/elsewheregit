import { auth } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

const FOLDERS = new Set(['elsewhere/photos', 'elsewhere/videos'])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'signed-out' }, { status: 401 })
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('[cloudinary sign] Cloudinary env vars are missing')
    return NextResponse.json({ error: 'config' }, { status: 500 })
  }
  const body = await req.json().catch(() => ({}))
  const folder = FOLDERS.has(body?.folder) ? body.folder : 'elsewhere/photos'
  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, process.env.CLOUDINARY_API_SECRET)
  return NextResponse.json({
    signature, timestamp, folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  })
}

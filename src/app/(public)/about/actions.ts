'use server'

import { resend } from '@/lib/resend'

const CONTACT_TO = process.env.CONTACT_EMAIL ?? 'arjun@elsewhere.ink'
const CONTACT_FROM = process.env.CONTACT_FROM ?? 'onboarding@resend.dev'

type ContactState = { ok: boolean; message: string } | null

export async function sendContactForm(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const organisation = String(formData.get('organisation') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!name || !email || !message) return { ok: false, message: 'Please fill in your name, email and message.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Please enter a valid email address.' }
  if (message.length > 5000) return { ok: false, message: 'Please keep the message under 5,000 characters.' }

  const fallback = `Something went wrong sending this. Please email ${CONTACT_TO} directly.`
  if (!process.env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY is not set')
    return { ok: false, message: fallback }
  }
  try {
    // Resend reports failures in the return value rather than by throwing.
    const { error } = await resend.emails.send({
      from: `Elsewhere Contact <${CONTACT_FROM}>`,
      to: CONTACT_TO,
      replyTo: email,
      subject: `New message from ${name}`,
      text: [`Name: ${name}`, `Email: ${email}`, organisation ? `Organisation: ${organisation}` : '', '', message].filter(Boolean).join('\n'),
    })
    if (error) {
      console.error('[contact] Resend error', error)
      return { ok: false, message: fallback }
    }
    return { ok: true, message: 'Message sent. We’ll be in touch.' }
  } catch (err) {
    console.error('[contact]', err)
    return { ok: false, message: fallback }
  }
}

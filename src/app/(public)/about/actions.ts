'use server'

import { resend } from '@/lib/resend'

const CONTACT_TO = process.env.CONTACT_EMAIL ?? 'arjun@elsewhere.ink'
const CONTACT_FROM = process.env.CONTACT_FROM ?? 'contact@elsewhere.ink'

type ContactState = { ok: boolean; message: string } | null

export async function sendContactForm(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const organisation = (formData.get('organisation') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()

  if (!name || !email || !message) {
    return { ok: false, message: 'Please fill in your name, email, and message.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { ok: false, message: 'Please enter a valid email address.' }
  }

  try {
    await resend.emails.send({
      from: `Elsewhere Contact <${CONTACT_FROM}>`,
      to: CONTACT_TO,
      replyTo: email,
      subject: `New message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        organisation ? `Organisation: ${organisation}` : '',
        '',
        message,
      ]
        .filter(Boolean)
        .join('\n'),
    })

    return { ok: true, message: "Message sent. We’ll be in touch." }
  } catch {
    return { ok: false, message: 'Something went wrong. Please try emailing directly.' }
  }
}

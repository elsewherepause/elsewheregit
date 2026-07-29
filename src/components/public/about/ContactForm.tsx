'use client'

import { useActionState } from 'react'
import { sendContactForm } from '@/app/(public)/about/actions'

const mont: React.CSSProperties = { fontFamily: 'Montserrat, sans-serif' }
const dm: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }

export default function ContactForm({ mobile }: { mobile?: boolean }) {
  const [state, formAction, pending] = useActionState(sendContactForm, null)

  if (state?.ok) {
    return (
      <p style={{ fontWeight: 500, fontStyle: 'italic', fontSize: mobile ? 18 : 24, color: '#000', lineHeight: 'normal', margin: 0, ...dm }}>
        {state.message}
      </p>
    )
  }

  if (mobile) {
    return (
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
        <p style={{ fontWeight: 500, fontStyle: 'italic', fontSize: 22, color: '#000', textTransform: 'uppercase', lineHeight: 1.2, margin: 0, ...dm }}>
          Tell us what you&apos;re working on and why it matters to you.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>
          <FormField name="name" label="your name" placeholder="How shall we address you" />
          <FormField name="email" label="your email" placeholder="Where we can write back" type="email" />
          <FormField name="organisation" label="organisation or project" placeholder="Optional — what you're part of" />
          <FormField name="message" label="your message" placeholder="What you're working on and why it matters to you" textarea />
        </div>

        {state && !state.ok && (
          <p style={{ fontSize: 13, color: '#b8292f', margin: 0, ...mont }}>
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-end',
            cursor: pending ? 'wait' : 'pointer',
            background: 'none', border: 'none', padding: 0,
            opacity: pending ? 0.5 : 1,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14, color: '#ccc', textTransform: 'uppercase', ...mont }}>
            {pending ? 'sending...' : 'send'}
          </span>
          <img alt="" style={{ width: 4, height: 7 }} src="/icons/send-arrow.svg" />
        </button>
      </form>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 47, alignItems: 'flex-end', width: 765 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 93, width: '100%' }}>
        <p style={{ fontWeight: 500, fontStyle: 'italic', fontSize: 32, color: '#000', textTransform: 'uppercase', width: 571, lineHeight: 'normal', margin: 0, ...dm }}>
          Tell us what you&apos;re working on and why it matters to you.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 50, width: '100%' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', width: '100%' }}>
            <FormField name="name" label="your name" placeholder="How shall we address you" style={{ width: 370 }} />
            <FormField name="email" label="your email" placeholder="Where we can write back" type="email" style={{ width: 371 }} />
          </div>
          <FormField name="organisation" label="organisation or project" placeholder="Optional — what you're part of" style={{ width: '100%' }} />
          <FormField name="message" label="your message" placeholder="What you're working on and why it matters to you" textarea style={{ width: '100%' }} />
        </div>
      </div>

      {state && !state.ok && (
        <p style={{ fontSize: 14, color: '#b8292f', margin: 0, alignSelf: 'flex-start', ...mont }}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          cursor: pending ? 'wait' : 'pointer',
          background: 'none', border: 'none', padding: 0,
          opacity: pending ? 0.5 : 1,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 16, color: '#ccc', textTransform: 'uppercase', ...mont }}>
          {pending ? 'sending...' : 'send'}
        </span>
        <img alt="" style={{ width: 4, height: 7 }} src="/icons/send-arrow.svg" />
      </button>
    </form>
  )
}

function FormField({ name, label, placeholder, type = 'text', textarea, style }: {
  name: string
  label: string
  placeholder: string
  type?: string
  textarea?: boolean
  style?: React.CSSProperties
}) {
  const inputStyle: React.CSSProperties = {
    fontSize: 14, color: '#000', fontWeight: 400,
    border: 'none', borderBottom: '1px solid #585858', outline: 'none',
    background: 'transparent', width: '100%',
    paddingTop: 12, paddingBottom: 12, paddingRight: 8,
    resize: 'none',
    ...mont,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      <label style={{ fontSize: 14, color: '#585858', textTransform: 'uppercase', fontWeight: 400, margin: 0, ...mont }}>
        {label}
      </label>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={3}
          style={inputStyle}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  )
}

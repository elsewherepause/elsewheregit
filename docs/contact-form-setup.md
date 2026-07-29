# Contact Form Setup (Resend)

The contact form on the About page sends emails via [Resend](https://resend.com).

## Quick Start

### 1. Create a Resend account

Go to [resend.com](https://resend.com) and sign up (free tier = 100 emails/day).

### 2. Get your API key

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click **Create API Key**
3. Name it something like `elsewhere-contact`
4. Select **Sending access** permission
5. Copy the key (starts with `re_`)

### 3. Add the API key to your environment

In `.env.local`:

```
RESEND_API_KEY="re_your_key_here"
CONTACT_EMAIL="arjun@elsewhere.ink"
CONTACT_FROM="onboarding@resend.dev"
```

That's it — the form will work immediately using Resend's test sender (`onboarding@resend.dev`).

> **Note:** With the test sender, emails can only be delivered to the email address associated with your Resend account. To send to any address, verify your domain (next step).

### 4. Verify your domain (recommended for production)

This lets you send from `contact@elsewhere.ink` instead of `onboarding@resend.dev`.

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **Add Domain** and enter `elsewhere.ink`
3. Resend will give you DNS records to add (MX, SPF, DKIM)
4. Add them via your domain registrar / DNS provider
5. Click **Verify** in Resend once records propagate (usually < 5 minutes)
6. Update `.env.local`:

```
CONTACT_FROM="contact@elsewhere.ink"
```

### 5. Deploy

Add the same env vars to your hosting provider (Vercel, etc.):

- `RESEND_API_KEY`
- `CONTACT_EMAIL`
- `CONTACT_FROM`

## How It Works

- User fills out the form on `/about`
- Form submits via a Next.js server action (`src/app/(public)/about/actions.ts`)
- Server action validates inputs and calls Resend API (`src/lib/resend.ts`)
- Email is delivered to `CONTACT_EMAIL` with reply-to set to the user's email
- On success, the form shows a confirmation message

## Files

| File | Purpose |
|------|---------|
| `src/app/(public)/about/actions.ts` | Server action — validates and sends |
| `src/lib/resend.ts` | Resend client instance |
| `src/components/public/about/ContactForm.tsx` | Form UI with submit handling |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Something went wrong" on submit | Check `RESEND_API_KEY` is set and valid |
| Email not arriving | Check spam folder; with test sender, emails only go to your Resend account email |
| Want to send from your domain | Complete step 4 (domain verification) |
| Rate limited | Free tier is 100 emails/day, 1 email/second |

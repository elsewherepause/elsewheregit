# Rebuild notes — November 2026

## Deploy in 3 steps

1. **Update the database once.** Easiest: run `deploy.ps1` (see below), which does all of this. Manually, with your production `DATABASE_URL` / `DIRECT_URL` set:

   ```bash
   npm install
   npx prisma generate
   npx prisma db execute --file prisma/migrations/20261105000000_story_and_sync/migration.sql --schema prisma/schema.prisma
   ```

   This only *adds* things (a `story` column on stories, plus any columns/tables that were missing). It deletes nothing and is safe to run twice.
   **Don’t use `prisma db push`:** your database has an old `HomepageCanvasItem` table that isn’t in the schema, so `db push` would try to delete it.

2. **Check Vercel environment variables** (Project → Settings → Environment Variables): `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_SITE_URL`, and for the contact form `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM` (must be an address on a domain verified in Resend).

3. **Push / redeploy.** The build runs `prisma generate` then `next build` as before.

## What changed

- **One story template.** Templates 1–4 are gone. A story is a cover plus blocks (Chapter, Text, Photos, Quote). Photos are laid out automatically by `src/lib/story/layout.ts` — any number, any mix of portrait/landscape, never cropped.
- **Old stories still work.** Stories made with Templates 1–4 are converted on the fly (`src/lib/story/legacy.ts`). Open one in the admin, check it, and press Save/Publish to store it in the new format. The original data stays untouched in `templateData` as a backup.
- **Publishing is reliable.** “Publish” always saves first; the admin shows clear success/error messages; the live page updates immediately; publishing never reorders the home page.
- **Uploads.** Photos over 10 MB are shrunk in the browser before upload; every failed file shows the reason. Media still used somewhere can’t be deleted.
- **Home:** reveal zigzag, newest first. **Open Rolls:** Photos / Notes / Videos, newest first. **Notes & stories:** correct “Next note” / “Next story” links. **One music player** for the whole site, never overlapping the footer.
- **Contact form** now reports a real failure instead of a false “sent”.

## Old code

The previous template system is in `legacy-removed/` (ignored by TypeScript, ESLint and the build). Once you’re happy with the new site you can delete that folder.

## Admin login

The password is stored only as a one-way hash, so it can’t be read back. If it’s lost, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` and run `npx prisma db seed` to reset it.

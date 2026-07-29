This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This app is ready for Vercel, but it needs the same production services that it uses locally.

1. Import the repository into Vercel and keep the project root at the repository root.
2. Add these environment variables in Vercel for Production and Preview:
	- `DATABASE_URL`
	- `DIRECT_URL`
	- `AUTH_SECRET`
	- `AUTH_URL`
	- `NEXTAUTH_URL`
	- `CLOUDINARY_CLOUD_NAME`
	- `CLOUDINARY_API_KEY`
	- `CLOUDINARY_API_SECRET`
	- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
	- `NEXT_PUBLIC_SITE_URL`
	- `ADMIN_EMAIL`
	- `ADMIN_PASSWORD`
3. Point `DATABASE_URL` at your hosted Postgres database and `DIRECT_URL` at the direct migration connection string.
4. Set `AUTH_URL` or `NEXTAUTH_URL` to the deployed Vercel domain after the first deployment.
5. Set `NEXT_PUBLIC_SITE_URL` to the deployed Vercel domain after the first deployment.
6. Do not use `NEXT_PUBLIC_AUTH_URL`; the login flow does not read it.
7. Run Prisma migrations against production before relying on the app in production.

Notes:

- The build script already runs `prisma generate` before `next build`.
- Cloudinary is used for both server-side signing and client-side image URLs, so its env vars must be present.
- The sitemap and robots metadata use `NEXT_PUBLIC_SITE_URL`, so set it to the canonical domain, not localhost.

redeploy commit 1

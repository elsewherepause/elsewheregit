export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Web addresses already used by pages of the site; a story can’t take them. */
export const RESERVED_SLUGS = new Set([
  'home', 'gallery', 'about', 'notes', 'admin', 'auth', 'api', 'sitemap', 'sitemap-xml', 'robots', 'robots-txt',
  'icon', 'apple-icon', 'favicon', 'images', 'icons', 'videos', 'audio', '_next',
])

export function slugProblem(slug: string): string | null {
  if (!slug) return 'Add a web address (letters, numbers and dashes).'
  if (slug.length > 80) return 'That web address is too long — keep it under 80 characters.'
  if (RESERVED_SLUGS.has(slug)) return `“${slug}” is already used by another page of the site. Pick a different web address.`
  return null
}

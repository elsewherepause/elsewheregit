import sanitizeHtml from 'sanitize-html'

/** Cleans note HTML from the editor so only safe formatting reaches the page. */
export function sanitizeNoteHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'hr'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tag, attribs) => ({ tagName: 'a', attribs: { ...attribs, rel: 'noopener noreferrer', ...(attribs.href?.startsWith('http') ? { target: '_blank' } : {}) } }),
    },
  })
}

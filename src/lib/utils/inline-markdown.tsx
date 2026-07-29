import React from 'react'

export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null
  // Split on **bold** and *italic* markers, preserving delimiters
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

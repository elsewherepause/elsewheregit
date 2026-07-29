'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import type { RichTextBlockPayload } from '@/lib/types/blocks'

type Props = {
  payload: { type: 'RICH_TEXT' } & RichTextBlockPayload
  onChange: (u: Partial<{ type: 'RICH_TEXT' } & RichTextBlockPayload>) => void
}

export default function RichTextEditor({ payload, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, code: false, codeBlock: false, blockquote: false, bulletList: false, orderedList: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your story…' }),
    ],
    content: payload.html,
    onUpdate({ editor }) {
      onChange({ html: editor.getHTML() })
    },
    editorProps: {
      attributes: { class: 'tiptap min-h-[120px] text-sm' },
    },
  })

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Heading</label>
        <input
          value={payload.heading ?? ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          className="field-input"
          placeholder="Optional heading"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-[var(--color-ink-muted)]">Content</label>
        {editor && (
          <div className="flex gap-1 mb-1.5">
            {[
              { label: 'B', title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
              { label: 'I', title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
              { label: '⌥', title: 'Link', action: () => {
                const url = prompt('URL:')
                if (url) editor.chain().focus().setLink({ href: url }).run()
              }, active: editor.isActive('link') },
            ].map(({ label, title, action, active }) => (
              <button
                key={label}
                title={title}
                onClick={action}
                type="button"
                className={`px-2 py-0.5 text-xs border transition-colors ${active ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' : 'border-[var(--color-border)] hover:border-[var(--color-ink)]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="border border-[var(--color-border)] px-3 py-2 focus-within:border-[var(--color-ink)] transition-colors">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

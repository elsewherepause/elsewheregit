'use client'

import { useActionState } from 'react'
import { createProject } from '@/actions/project.actions'

export default function NewProjectPage() {
  const [state, action, pending] = useActionState(createProject, undefined)

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-medium mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
        New Project
      </h1>

      <form action={action} className="space-y-5">
        {state?.error && (
          <p className="text-sm text-[var(--color-accent)]">{state.error}</p>
        )}

        <div className="space-y-1">
          <label htmlFor="title" className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            autoFocus
            className="w-full border border-[var(--color-border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="slug" className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
            Slug <span className="normal-case text-[var(--color-ink-faint)]">(auto-generated if blank)</span>
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            className="w-full border border-[var(--color-border)] px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--color-ink)] transition-colors"
            placeholder="my-project-slug"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="template" className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
            Template
          </label>
          <select
            id="template"
            name="template"
            className="w-full border border-[var(--color-border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors bg-transparent appearance-none rounded-none"
            defaultValue="TEMPLATE_1"
          >
            <option value="TEMPLATE_1">Template 1</option>
            <option value="TEMPLATE_2">Template 2</option>
            <option value="TEMPLATE_3">Template 3</option>
            <option value="TEMPLATE_4">Template 4</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="category" className="block text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full border border-[var(--color-border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors bg-transparent appearance-none rounded-none"
            defaultValue=""
          >
            <option value="">None</option>
            <option value="CULTURE">Culture</option>
            <option value="ADVENTURE">Adventure</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {pending ? 'Creating…' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateProject, publishProject, unpublishProject, deleteProject } from '@/actions/project.actions'
import BlockBuilder from '@/components/admin/block-builder/BlockBuilder'
import MediaPicker from '@/components/admin/media/MediaPicker'
import type { Project, ContentBlock, MediaAsset } from '@prisma/client'

type FullProject = Project & {
  blocks: ContentBlock[]
  heroImage: MediaAsset | null
  ogImage: MediaAsset | null
}

type Props = { project: FullProject }

export default function ProjectEditor({ project }: Props) {
  const [title, setTitle] = useState(project.title)
  const [slug, setSlug] = useState(project.slug)
  const [description, setDescription] = useState(project.description ?? '')
  const [heroImage, setHeroImage] = useState<MediaAsset | null>(project.heroImage)
  const [seoTitle, setSeoTitle] = useState(project.seoTitle ?? '')
  const [seoDescription, setSeoDescription] = useState(project.seoDescription ?? '')
  const [pickerTarget, setPickerTarget] = useState<'hero' | 'og' | null>(null)
  const [saving, startSave] = useTransition()
  const [publishing, startPublish] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    startSave(async () => {
      const res = await updateProject(project.id, {
        title,
        slug,
        description: description || undefined,
        heroImageId: heroImage?.id ?? null,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
      })
      if (res?.error) setError(res.error)
      else setError(null)
    })
  }

  function handlePublishToggle() {
    startPublish(async () => {
      if (project.published) await unpublishProject(project.id)
      else await publishProject(project.id)
    })
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/projects" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            ← Projects
          </Link>
          <span className={`text-xs uppercase tracking-widest px-2 py-0.5 rounded-full ${project.published ? 'bg-green-100 text-green-700' : 'bg-[var(--color-admin-bg)] text-[var(--color-ink-muted)]'}`}>
            {project.published ? 'Published' : 'Draft'}
          </span>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-light border-0 border-b border-[var(--color-border)] pb-3 mb-6 focus:outline-none focus:border-[var(--color-ink)] bg-transparent transition-colors"
          style={{ fontFamily: 'var(--font-heading)' }}
          placeholder="Project title"
        />

        <BlockBuilder projectId={project.id} initialBlocks={project.blocks} />
      </div>

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-l border-[var(--color-border)] overflow-y-auto bg-[var(--color-admin-bg)] p-5 space-y-6">
        {error && <p className="text-xs text-[var(--color-accent)]">{error}</p>}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={handlePublishToggle}
            disabled={publishing}
            className={`w-full py-2 text-xs uppercase tracking-widest border transition-colors disabled:opacity-40 ${
              project.published
                ? 'border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink)]'
                : 'border-green-500 text-green-600 hover:bg-green-50'
            }`}
          >
            {publishing ? '…' : project.published ? 'Unpublish' : 'Publish'}
          </button>
          {project.published && (
            <Link
              href={`/${project.slug}`}
              target="_blank"
              className="w-full py-2 text-xs uppercase tracking-widest border border-[var(--color-border)] text-center text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] transition-colors"
            >
              View Live ↗
            </Link>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-[var(--color-border)] px-2 py-1.5 text-xs font-mono bg-white focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-[var(--color-border)] px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-[var(--color-ink)] transition-colors resize-none"
            placeholder="Short description…"
          />
        </div>

        {/* Hero Image */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">Hero Image</label>
          {heroImage ? (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_300,q_auto,f_auto/${heroImage.cloudinaryId}`}
                alt=""
                className="w-full aspect-video object-cover"
              />
              <button
                onClick={() => setHeroImage(null)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPickerTarget('hero')}
              className="w-full aspect-video border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] transition-colors"
            >
              Select Image
            </button>
          )}
        </div>

        {/* SEO */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)]">SEO</div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-ink-muted)]">Meta Title</label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full border border-[var(--color-border)] px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-[var(--color-ink)] transition-colors"
              placeholder="Defaults to project title"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-ink-muted)]">Meta Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className="w-full border border-[var(--color-border)] px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-[var(--color-ink)] transition-colors resize-none"
              placeholder="Defaults to project description"
            />
          </div>
        </div>

        {/* Danger zone */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <form action={deleteProject.bind(null, project.id)}>
            <button
              type="submit"
              onClick={(e) => { if (!confirm('Delete this project? This cannot be undone.')) e.preventDefault() }}
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              Delete project
            </button>
          </form>
        </div>
      </aside>

      {pickerTarget && (
        <MediaPicker
          onSelect={(asset) => {
            if (pickerTarget === 'hero') setHeroImage(asset)
            setPickerTarget(null)
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  )
}

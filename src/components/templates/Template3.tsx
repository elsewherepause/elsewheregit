'use client'

import { useState, useEffect } from 'react'
import Template3Layout from './Template3Layout'
import MobileProjectLayout from './MobileProjectLayout'
import { PATTERNS } from './patterns/template3'
import type { TemplateData } from '@/components/admin/template-editor/shared'

type TemplateProject = { templateData: unknown }

export default function Template3({ project }: { project: TemplateProject }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const data: Partial<TemplateData> =
    typeof project.templateData === 'string'
      ? JSON.parse(project.templateData)
      : (project.templateData as Partial<TemplateData>) ?? {}

  if (isMobile) {
    const destinations = (data as Record<string, unknown>).destinations as { slug: string }[] ?? []
    const nextProjectSlug = (data as Record<string, unknown>).nextProjectSlug as string | undefined
    return (
      <MobileProjectLayout
        data={data}
        patterns={PATTERNS}
        nextProject={nextProjectSlug ? { slug: nextProjectSlug, title: '' } : null}
        destinations={destinations}
      />
    )
  }

  return <Template3Layout data={data} />
}

'use client'

import TemplateEditor from '@/components/admin/template-editor/TemplateEditor'
import Template4Layout from '@/components/templates/Template4Layout'
import { PATTERNS } from '@/components/templates/patterns/template4'
import type { Project, MediaAsset } from '@prisma/client'

type FullProject = Project & { heroImage: MediaAsset | null; ogImage: MediaAsset | null }
type Slot = { w: number; h: number }

export default function Template4Editor({ project, homepageSlot }: { project: FullProject; homepageSlot?: Slot | null }) {
  return <TemplateEditor project={project} patterns={PATTERNS} Layout={Template4Layout} homepageSlot={homepageSlot} />
}

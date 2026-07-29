'use client'

import TemplateEditor from '@/components/admin/template-editor/TemplateEditor'
import Template3Layout from '@/components/templates/Template3Layout'
import { PATTERNS } from '@/components/templates/patterns/template3'
import type { Project, MediaAsset } from '@prisma/client'

type FullProject = Project & { heroImage: MediaAsset | null; ogImage: MediaAsset | null }
type Slot = { w: number; h: number }

export default function Template3Editor({ project, homepageSlot }: { project: FullProject; homepageSlot?: Slot | null }) {
  return <TemplateEditor project={project} patterns={PATTERNS} Layout={Template3Layout} homepageSlot={homepageSlot} />
}

'use client'

import TemplateEditor from '@/components/admin/template-editor/TemplateEditor'
import Template1Layout from '@/components/templates/Template1Layout'
import { PATTERNS } from '@/components/templates/patterns/template1'
import type { Project, MediaAsset } from '@prisma/client'

type FullProject = Project & { heroImage: MediaAsset | null; ogImage: MediaAsset | null }
type Slot = { w: number; h: number }

export default function Template1Editor({ project, homepageSlot }: { project: FullProject; homepageSlot?: Slot | null }) {
  return <TemplateEditor project={project} patterns={PATTERNS} Layout={Template1Layout} homepageSlot={homepageSlot} />
}

'use client'

import { deleteProject } from '@/actions/project.actions'

export default function DeleteButton({ projectId }: { projectId: string }) {
  return (
    <button
      onClick={() => {
        if (confirm('Delete this project? This cannot be undone.')) {
          deleteProject(projectId)
        }
      }}
      className="text-xs text-red-400 hover:text-red-600 transition-colors"
    >
      Delete
    </button>
  )
}

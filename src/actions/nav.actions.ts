'use server'

import { getStoryOrder } from '@/lib/utils/next-project'

/** Stories for the menu, newest first. Public — no login needed. */
export async function getNavProjects() {
  try {
    return await getStoryOrder()
  } catch (error) {
    console.error('Error fetching nav projects:', error)
    return []
  }
}

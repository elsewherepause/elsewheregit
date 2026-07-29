'use server';

import { prisma } from '@/lib/prisma';

export async function getNavProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      select: {
        slug: true,
        title: true,
      },
      orderBy: { publishedAt: 'asc' },
    });
    return projects;
  } catch (error) {
    console.error("Error fetching nav projects from database:", error);
    return [];
  }
}


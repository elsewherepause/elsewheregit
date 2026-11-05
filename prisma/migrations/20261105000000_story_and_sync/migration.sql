-- Brings any database up to the current schema. Every statement is safe to run
-- on a database that already has some or all of these changes (e.g. one that was
-- set up with `prisma db push`), and nothing here deletes data.

-- Enums that were added to the schema without a migration
DO $$ BEGIN
  CREATE TYPE "ProjectTemplate" AS ENUM ('CUSTOM', 'TEMPLATE_1', 'TEMPLATE_2', 'TEMPLATE_3', 'TEMPLATE_4');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectCategory" AS ENUM ('CULTURE', 'ADVENTURE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Project: legacy template columns + the new story column
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "template" "ProjectTemplate" NOT NULL DEFAULT 'CUSTOM';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "templateData" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "category" "ProjectCategory";
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "story" JSONB;

-- GalleryImage: alt text became optional, crop adjust added
ALTER TABLE "GalleryImage" ALTER COLUMN "altText" DROP NOT NULL;
ALTER TABLE "GalleryImage" ADD COLUMN IF NOT EXISTS "imageAdjust" JSONB;

-- Notes table
CREATE TABLE IF NOT EXISTS "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readTime" TEXT NOT NULL DEFAULT '2 min read',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "headerImageId" TEXT,
    "footerImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Note_slug_key" ON "Note"("slug");
CREATE INDEX IF NOT EXISTS "Note_published_idx" ON "Note"("published");

DO $$ BEGIN
  ALTER TABLE "Note" ADD CONSTRAINT "Note_headerImageId_fkey" FOREIGN KEY ("headerImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Note" ADD CONSTRAINT "Note_footerImageId_fkey" FOREIGN KEY ("footerImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

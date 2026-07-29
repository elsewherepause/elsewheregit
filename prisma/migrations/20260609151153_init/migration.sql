-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('INTRO', 'RICH_TEXT', 'FULL_WIDTH_IMAGE', 'IMAGE_TEXT', 'PORTRAIT_IMAGE', 'LANDSCAPE_IMAGE', 'GALLERY', 'QUOTE', 'DIVIDER', 'SPACER');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "heroImageId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "order" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageCanvasItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "imageId" TEXT NOT NULL,
    "xPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "widthPercent" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "heightPercent" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageCanvasItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "cloudinaryUrl" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_publishedAt_idx" ON "Project"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "ContentBlock_projectId_order_idx" ON "ContentBlock"("projectId", "order");

-- CreateIndex
CREATE INDEX "HomepageCanvasItem_zIndex_idx" ON "HomepageCanvasItem"("zIndex");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_cloudinaryId_key" ON "MediaAsset"("cloudinaryId");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageCanvasItem" ADD CONSTRAINT "HomepageCanvasItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageCanvasItem" ADD CONSTRAINT "HomepageCanvasItem_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

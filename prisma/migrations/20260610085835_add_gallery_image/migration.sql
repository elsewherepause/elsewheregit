-- CreateEnum
CREATE TYPE "GalleryMediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "caption" TEXT,
    "description" TEXT,
    "category" TEXT,
    "mediaType" "GalleryMediaType" NOT NULL DEFAULT 'PHOTO',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryImage_order_idx" ON "GalleryImage"("order");

-- CreateIndex
CREATE INDEX "GalleryImage_category_idx" ON "GalleryImage"("category");

-- CreateIndex
CREATE INDEX "GalleryImage_published_idx" ON "GalleryImage"("published");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

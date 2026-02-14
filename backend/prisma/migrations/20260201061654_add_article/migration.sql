-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "naverUrl" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "refinedTitle" TEXT NOT NULL,
    "refinedSummary" TEXT NOT NULL,
    "shortSummary" TEXT NOT NULL,
    "relatedTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_naverUrl_key" ON "articles"("naverUrl");

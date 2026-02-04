/*
  Warnings:

  - You are about to drop the column `isActive` on the `parties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "parties" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "balance_games" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "agreeCount" INTEGER NOT NULL DEFAULT 0,
    "disagreeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_votes" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "isAgree" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_comments" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "balance_votes_userId_gameId_key" ON "balance_votes"("userId", "gameId");

-- CreateIndex
CREATE INDEX "balance_comments_gameId_createdAt_idx" ON "balance_comments"("gameId", "createdAt");

-- AddForeignKey
ALTER TABLE "balance_votes" ADD CONSTRAINT "balance_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_votes" ADD CONSTRAINT "balance_votes_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "balance_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_comments" ADD CONSTRAINT "balance_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_comments" ADD CONSTRAINT "balance_comments_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "balance_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_comments" ADD CONSTRAINT "balance_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "balance_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

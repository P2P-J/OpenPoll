/*
  Warnings:

  - You are about to drop the column `traits` on the `dos_result_types` table. All the data in the column will be lost.
  - Added the required column `detail` to the `dos_result_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `features` to the `dos_result_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `dos_result_types` table without a default value. This is not possible if the table is not empty.

*/
-- 기존 데이터 삭제 (시드로 다시 넣을 예정)
DELETE FROM "dos_result_types";

-- AlterTable
ALTER TABLE "dos_result_types" DROP COLUMN "traits",
ADD COLUMN     "detail" TEXT NOT NULL,
ADD COLUMN     "features" TEXT NOT NULL,
ADD COLUMN     "tag" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "balance_comment_likes" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "balance_comment_likes_userId_commentId_key" ON "balance_comment_likes"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "balance_comment_likes" ADD CONSTRAINT "balance_comment_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_comment_likes" ADD CONSTRAINT "balance_comment_likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "balance_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

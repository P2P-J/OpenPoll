-- CreateIndex
CREATE INDEX "articles_createdAt_idx" ON "articles"("createdAt");

-- CreateIndex
CREATE INDEX "balance_comment_likes_commentId_idx" ON "balance_comment_likes"("commentId");

-- CreateIndex
CREATE INDEX "balance_votes_gameId_idx" ON "balance_votes"("gameId");

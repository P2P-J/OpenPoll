import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { keyOf, countAllComments } from "@/shared/utils/balanceHelpers";
import { CommentItem } from "./CommentItem";
import type { BalanceComment, VoteSide } from "@/types/balance.types";

interface BalanceCommentSectionProps {
  isLoggedIn: boolean;
  isLoggedInNow: () => boolean;
  selectedOption: VoteSide;
  comment: string;
  setComment: (v: string) => void;
  comments: BalanceComment[];
  openLoginModal: () => void;
  isAdmin: boolean;
  isMyComment: (c: BalanceComment) => boolean;
  expandedComments: Set<string>;
  editingCommentId: string | null;
  editingContent: string;
  replyToId: string | null;
  replyContent: string;
  setEditingCommentId: (v: string | null) => void;
  setEditingContent: (v: string) => void;
  setReplyToId: (v: string | null) => void;
  setReplyContent: (v: string) => void;
  handleStartReply: (commentId: string | number, depth: number) => void;
  handleSubmitReply: (parentId: string | number) => void;
  handleStartEdit: (c: BalanceComment) => void;
  handleSubmitEdit: (commentId: string | number) => void;
  handleDeleteComment: (commentId: string | number) => void;
  handleToggleLike: (commentId: string | number) => void;
  toggleExpandReplies: (commentId: string | number) => void;
  handleSubmitComment: () => void;
}

export function BalanceCommentSection({
  isLoggedIn,
  isLoggedInNow,
  selectedOption,
  comment,
  setComment,
  comments,
  openLoginModal,
  isAdmin,
  isMyComment,
  expandedComments,
  editingCommentId,
  editingContent,
  replyToId,
  replyContent,
  setEditingCommentId,
  setEditingContent,
  setReplyToId,
  setReplyContent,
  handleStartReply,
  handleSubmitReply,
  handleStartEdit,
  handleSubmitEdit,
  handleDeleteComment,
  handleToggleLike,
  toggleExpandReplies,
  handleSubmitComment,
}: BalanceCommentSectionProps) {
  const renderCommentNode = (c: BalanceComment, depth = 0): ReactNode => (
    <CommentItem
      comment={c}
      depth={depth}
      isLoggedIn={isLoggedIn}
      isLoggedInNow={isLoggedInNow}
      isMyComment={isMyComment}
      isAdmin={isAdmin}
      selectedOption={selectedOption}
      expandedComments={expandedComments}
      editingCommentId={editingCommentId}
      editingContent={editingContent}
      replyToId={replyToId}
      replyContent={replyContent}
      setEditingCommentId={setEditingCommentId}
      setEditingContent={setEditingContent}
      setReplyToId={setReplyToId}
      setReplyContent={setReplyContent}
      onStartReply={handleStartReply}
      onSubmitReply={handleSubmitReply}
      onStartEdit={handleStartEdit}
      onSubmitEdit={handleSubmitEdit}
      onDeleteComment={handleDeleteComment}
      onToggleLike={handleToggleLike}
      onToggleExpandReplies={toggleExpandReplies}
      renderChild={renderCommentNode}
      openLoginModal={openLoginModal}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 border-2 border-white/10 overflow-hidden"
    >
      <div className="relative">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          댓글 {countAllComments(comments)}개
        </h2>

        <div className="mb-8">
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                selectedOption === "agree"
                  ? "bg-white/20 border border-white/30"
                  : selectedOption === "disagree"
                    ? "bg-white/10 border border-white/20"
                    : "bg-white/5 border border-white/10"
              }`}
            >
              {selectedOption === "agree" ? (
                <ThumbsUp className="w-5 h-5" />
              ) : selectedOption === "disagree" ? (
                <ThumbsDown className="w-5 h-5" />
              ) : (
                <span className="text-xs">?</span>
              )}
            </div>

            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  !isLoggedIn
                    ? "로그인 후 댓글을 작성할 수 있어요"
                    : selectedOption
                      ? "의견을 남겨주세요..."
                      : "투표 후 댓글을 작성할 수 있어요"
                }
                readOnly={!isLoggedInNow() || !selectedOption}
                onFocus={() => !isLoggedInNow() && openLoginModal()}
                onClick={() => !isLoggedInNow() && openLoginModal()}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none text-white placeholder-gray-500 read-only:opacity-50 read-only:cursor-not-allowed"
                rows={3}
              />

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {!isLoggedIn
                    ? "⚠️ 로그인 필요"
                    : !selectedOption
                      ? "⚠️ 투표를 먼저 해주세요"
                      : ""}
                </span>

                <button
                  onClick={() => {
                    if (!isLoggedInNow()) {
                      openLoginModal();
                      return;
                    }
                    handleSubmitComment();
                  }}
                  disabled={
                    isLoggedInNow() ? !selectedOption || !comment.trim() : false
                  }
                  className="flex items-center space-x-2 px-6 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>댓글 작성</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-gray-500 text-sm">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </div>
          ) : (
            comments.map((c) => (
              <div key={keyOf(c.id)}>{renderCommentNode(c, 0)}</div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

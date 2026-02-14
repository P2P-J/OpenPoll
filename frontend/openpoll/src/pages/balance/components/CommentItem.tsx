import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { getAuthorLabel, keyOf } from "@/shared/utils/balanceHelpers";
import type { BalanceComment, VoteSide } from "@/types/balance.types";

interface CommentItemProps {
  comment: BalanceComment;
  depth: number;
  isLoggedIn: boolean;
  isLoggedInNow: () => boolean;
  isMyComment: (c: BalanceComment) => boolean;
  isAdmin: boolean;
  selectedOption: VoteSide;
  expandedComments: Set<string>;
  editingCommentId: string | null;
  editingContent: string;
  replyToId: string | null;
  replyContent: string;
  setEditingCommentId: (v: string | null) => void;
  setEditingContent: (v: string) => void;
  setReplyToId: (v: string | null) => void;
  setReplyContent: (v: string) => void;
  onStartReply: (commentId: string | number, depth: number) => void;
  onSubmitReply: (parentId: string | number) => void;
  onStartEdit: (c: BalanceComment) => void;
  onSubmitEdit: (commentId: string | number) => void;
  onDeleteComment: (commentId: string | number) => void;
  onToggleLike: (commentId: string | number) => void;
  onToggleExpandReplies: (commentId: string | number) => void;
  renderChild: (c: BalanceComment, depth: number) => ReactNode;
  openLoginModal: () => void;
}

export function CommentItem({
  comment: c,
  depth,
  isLoggedIn,
  isLoggedInNow,
  isMyComment,
  isAdmin,
  selectedOption,
  expandedComments,
  editingCommentId,
  editingContent,
  replyToId,
  replyContent,
  setEditingCommentId,
  setEditingContent,
  setReplyToId,
  setReplyContent,
  onStartReply,
  onSubmitReply,
  onStartEdit,
  onSubmitEdit,
  onDeleteComment,
  onToggleLike,
  onToggleExpandReplies,
  renderChild,
  openLoginModal,
}: CommentItemProps) {
  const replies = c.replies ?? [];
  const hasReplies = replies.length > 0;
  const isExpanded = expandedComments.has(keyOf(c.id));
  const isReply = depth > 0;

  const canReply = depth === 0;
  const canEdit = isLoggedInNow() && isMyComment(c);
  const canDelete = isLoggedInNow() && (isMyComment(c) || isAdmin);
  const isEditing = editingCommentId === keyOf(c.id);
  const isReplyBoxOpen = replyToId === keyOf(c.id);
  const isAgree = c.user?.isAgree;

  return (
    <div
      className={isReply ? "relative" : ""}
      style={{ paddingLeft: isReply ? "32px" : "0" }}
    >
      {isReply && (
        <>
          <div
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: "16px" }}
          />
          <div
            className="absolute h-px bg-white/20"
            style={{ left: "16px", top: "24px", width: "16px" }}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 sm:p-5 rounded-xl border ${
          isReply
            ? "bg-white/[0.03] border-white/10"
            : "bg-white/5 border-white/10"
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
            {isAgree === true ? (
              <ThumbsUp className="w-5 h-5" />
            ) : isAgree === false ? (
              <ThumbsDown className="w-5 h-5" />
            ) : (
              <span className="text-xs">?</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold">{getAuthorLabel(c)}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isAgree === true
                    ? "bg-white/10 text-white"
                    : isAgree === false
                      ? "bg-white/5 text-gray-400"
                      : "bg-white/5 text-gray-500"
                }`}
              >
                {isAgree === true
                  ? "찬성"
                  : isAgree === false
                    ? "반대"
                    : "미표기"}
              </span>
              <span className="text-sm text-gray-500">{c.createdAt}</span>
            </div>

            {isEditing ? (
              <>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none text-white placeholder-gray-500"
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingContent("");
                    }}
                    className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => onSubmitEdit(c.id)}
                    disabled={!editingContent.trim()}
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    저장
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-300 leading-relaxed mb-3 text-sm sm:text-base">
                {c.content}
              </p>
            )}

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onToggleLike(c.id)}
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Heart
                  className={`w-4 h-4 ${c.isLiked ? "text-white" : ""}`}
                  fill={c.isLiked ? "currentColor" : "none"}
                />
                <span className="font-medium">
                  {c.likes ?? c.likeCount ?? 0}
                </span>
              </button>

              {canReply && !isEditing && (
                <button
                  type="button"
                  onClick={() => onStartReply(c.id, depth)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  답글
                </button>
              )}
              {canEdit && !isEditing && (
                <button
                  type="button"
                  onClick={() => onStartEdit(c)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  수정
                </button>
              )}
              {canDelete && !isEditing && (
                <button
                  type="button"
                  onClick={() => onDeleteComment(c.id)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  삭제
                </button>
              )}
              {hasReplies && (
                <button
                  type="button"
                  onClick={() => onToggleExpandReplies(c.id)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {isExpanded ? "답글 숨기기" : `답글 ${replies.length}개`}
                </button>
              )}
            </div>

            {isReplyBoxOpen && canReply && !isEditing && (
              <div className="mt-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={
                    !isLoggedIn
                      ? "로그인 후 답글을 작성할 수 있어요"
                      : selectedOption
                        ? "답글을 남겨주세요..."
                        : "투표 후 답글을 작성할 수 있어요"
                  }
                  readOnly={!isLoggedInNow() || !selectedOption}
                  onFocus={() => !isLoggedInNow() && openLoginModal()}
                  onClick={() => !isLoggedInNow() && openLoginModal()}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none text-white placeholder-gray-500 read-only:opacity-50 read-only:cursor-not-allowed"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyToId(null);
                      setReplyContent("");
                    }}
                    className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => onSubmitReply(c.id)}
                    disabled={!selectedOption || !replyContent.trim()}
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    등록
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {hasReplies && isExpanded && (
        <div className="mt-3 space-y-3">
          {replies.map((r) => (
            <div key={keyOf(r.id)}>{renderChild(r, depth + 1)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

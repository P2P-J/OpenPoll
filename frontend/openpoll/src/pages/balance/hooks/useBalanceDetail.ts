import { useCallback, useEffect, useMemo, useState } from "react";
import { getSession } from "@/shared/utils/localAuth";
import {
  getBalanceDetail,
  getBalanceComments,
  voteBalance,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getErrorMessage,
} from "@/api";
import { useUser } from "@/contexts/UserContext";
import {
  keyOf,
  getMyUserIdFromSession,
  getMyNicknameFromSession,
  getAuthorLabel,
  getMyLabelFromSession,
  fromMyVote,
  toApiVote,
  applyVoteOptimistic,
  ensureCommentsShape,
} from "@/shared/utils/balanceHelpers";
import type {
  BalanceDetail,
  BalanceComment,
  BalanceDetailWithComments,
  VoteState,
  VoteOption,
  UseBalanceDetailResult,
} from "@/types/balance.types";

export function useBalanceDetail(id?: string): UseBalanceDetailResult {
  const { isAuthenticated } = useUser();

  const [selectedOption, setSelectedOption] = useState<VoteState>(null);
  const [comment, setComment] = useState("");

  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const [issue, setIssue] = useState<BalanceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isVoting, setIsVoting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isLoggedIn = isAuthenticated || !!getSession();
  const isLoggedInNow = useCallback(
    () =>
      isAuthenticated ||
      !!getSession() ||
      !!localStorage.getItem("accessToken"),
    [isAuthenticated]
  );

  const comments = useMemo<BalanceComment[]>(
    () => (issue ? (issue.comments ?? []) : []),
    [issue]
  );

  const isRootCommentId = (commentId: string | number) =>
    comments.some((c) => keyOf(c.id) === keyOf(commentId));

  const isMyComment = (c: BalanceComment): boolean => {
    const myId = getMyUserIdFromSession();
    const myNick = getMyNicknameFromSession();

    if (myId && c.user?.id != null) return String(c.user.id) === myId;
    if (myNick && c.user?.nickname) return String(c.user.nickname) === myNick;
    return getAuthorLabel(c) === getMyLabelFromSession();
  };

  const refreshComments = async (issueId: number) => {
    const commentList = (await getBalanceComments(issueId)) as BalanceComment[];
    setIssue((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: Array.isArray(commentList) ? commentList : [],
      };
    });
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const issueId = Number(id);
        if (!id || Number.isNaN(issueId))
          throw new Error("잘못된 이슈 ID 입니다.");

        const [detail, commentList] = await Promise.all([
          getBalanceDetail(issueId),
          getBalanceComments(issueId),
        ]);

        if (!mounted) return;

        const normalized = ensureCommentsShape(detail as BalanceDetail);
        const merged: BalanceDetailWithComments = {
          ...normalized,
          comments: (Array.isArray(commentList)
            ? commentList
            : []) as BalanceComment[],
        };

        setIssue(merged);
        setSelectedOption(
          isLoggedInNow()
            ? fromMyVote((merged as { myVote?: boolean | null }).myVote)
            : null
        );
      } catch (e) {
        if (!mounted) return;
        setErrorMessage(getErrorMessage(e));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [id, isAuthenticated, isLoggedInNow]);

  const handleVote = async (option: VoteOption) => {
    if (!issue || isVoting) return;
    if (!isLoggedInNow()) {
      setErrorMessage(null);
      setIsLoginModalOpen(true);
      return;
    }
    if (selectedOption) return;

    const prevIssue = issue;
    const nextIssue = applyVoteOptimistic(prevIssue, null, option);

    setSelectedOption(option);
    setIssue(nextIssue);

    try {
      setIsVoting(true);
      setErrorMessage(null);
      await voteBalance(prevIssue.id, toApiVote(option));
    } catch (e) {
      setSelectedOption(null);
      setIssue(prevIssue);
      setErrorMessage(getErrorMessage(e));
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!issue) return;
    if (!isLoggedInNow()) {
      setErrorMessage(null);
      setIsLoginModalOpen(true);
      return;
    }
    if (!selectedOption) return;

    const content = comment.trim();
    if (!content) return;
    setComment("");

    try {
      await createComment(issue.id, { content });
      await refreshComments(issue.id);
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleDeleteComment = async (commentId: string | number) => {
    if (!issue) return;
    if (!isLoggedInNow()) {
      setErrorMessage(null);
      setIsLoginModalOpen(true);
      return;
    }

    const commentIdNum =
      typeof commentId === "number" ? commentId : Number(commentId);
    if (Number.isNaN(commentIdNum)) return;

    try {
      await deleteComment(issue.id, commentIdNum);
      await refreshComments(issue.id);

      if (editingCommentId === keyOf(commentId)) {
        setEditingCommentId(null);
        setEditingContent("");
      }
      if (replyToId === keyOf(commentId)) {
        setReplyToId(null);
        setReplyContent("");
      }
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleStartReply = (commentId: string | number, depth: number) => {
    if (!isLoggedInNow()) {
      setErrorMessage(null);
      setIsLoginModalOpen(true);
      return;
    }
    if (!selectedOption) {
      setErrorMessage("투표 후 답글을 작성할 수 있어요.");
      return;
    }
    if (depth > 0) {
      setErrorMessage("답글은 대댓글까지만 작성할 수 있어요.");
      return;
    }

    setEditingCommentId(null);
    setEditingContent("");
    setReplyToId(keyOf(commentId));
    setReplyContent("");
  };

  const handleSubmitReply = async (parentId: string | number) => {
    if (!issue) return;
    if (!isLoggedInNow()) {
      setErrorMessage(null);
      setIsLoginModalOpen(true);
      return;
    }
    if (!selectedOption) return;
    if (!isRootCommentId(parentId)) {
      setErrorMessage("답글은 대댓글까지만 작성할 수 있어요.");
      return;
    }

    const content = replyContent.trim();
    if (!content) return;

    const parentIdNum =
      typeof parentId === "number" ? parentId : Number(parentId);
    if (Number.isNaN(parentIdNum)) return;

    setReplyContent("");
    setReplyToId(null);

    try {
      await createComment(issue.id, {
        content,
        parentId: parentIdNum,
      });
      await refreshComments(issue.id);

      setExpandedComments((prev) => {
        const next = new Set(prev);
        next.add(keyOf(parentId));
        return next;
      });
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleStartEdit = (c: BalanceComment) => {
    if (!isLoggedInNow()) {
      setErrorMessage(null);
      setIsLoginModalOpen(true);
      return;
    }
    if (!isMyComment(c)) {
      setErrorMessage("본인 댓글만 수정할 수 있어요.");
      return;
    }

    setReplyToId(null);
    setReplyContent("");
    setEditingCommentId(keyOf(c.id));
    setEditingContent(String(c.content ?? ""));
  };

  const handleSubmitEdit = async (commentId: string | number) => {
    if (!issue) return;
    if (!isLoggedInNow()) {
      setErrorMessage(null);
      setIsLoginModalOpen(true);
      return;
    }

    const content = editingContent.trim();
    if (!content) return;

    const commentIdNum =
      typeof commentId === "number" ? commentId : Number(commentId);
    if (Number.isNaN(commentIdNum)) return;

    try {
      await updateComment(issue.id, commentIdNum, { content });
      await refreshComments(issue.id);

      setEditingCommentId(null);
      setEditingContent("");
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleToggleLike = async (commentId: string | number) => {
    if (!issue) return;
    if (!isLoggedInNow()) {
      setErrorMessage(null);
      setIsLoginModalOpen(true);
      return;
    }

    const commentIdNum =
      typeof commentId === "number" ? commentId : Number(commentId);
    if (Number.isNaN(commentIdNum)) return;

    const prevIssue = issue;
    const prevComments = (prevIssue.comments ?? []) as BalanceComment[];

    const patchLikes = (nodes: BalanceComment[]): BalanceComment[] =>
      nodes.map((n) => {
        if (keyOf(n.id) === keyOf(commentId)) {
          const prevLiked = !!n.isLiked;
          const nextLiked = !prevLiked;
          const prevCount = Number(n.likes ?? n.likeCount ?? 0);
          const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));
          return {
            ...n,
            likes: nextCount,
            likeCount: nextCount,
            isLiked: nextLiked,
          };
        }
        if (n.replies?.length) return { ...n, replies: patchLikes(n.replies) };
        return n;
      });

    setIssue({ ...prevIssue, comments: patchLikes(prevComments) });

    try {
      await toggleCommentLike(prevIssue.id, commentIdNum);
      await refreshComments(prevIssue.id);
    } catch (e) {
      setIssue(prevIssue);
      setErrorMessage(getErrorMessage(e));
    }
  };

  return {
    issue,
    isLoading,
    errorMessage,
    isVoting,
    selectedOption,
    setSelectedOption,
    comment,
    setComment,
    replyToId,
    setReplyToId,
    replyContent,
    setReplyContent,
    editingCommentId,
    setEditingCommentId,
    editingContent,
    setEditingContent,
    expandedComments,
    setExpandedComments,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isLoggedIn,
    isLoggedInNow,
    comments,
    handleVote,
    handleSubmitComment,
    handleDeleteComment,
    handleStartReply,
    handleSubmitReply,
    handleStartEdit,
    handleSubmitEdit,
    handleToggleLike,
  };
}

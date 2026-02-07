import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { getSession } from "@/shared/utils/localAuth";
import {
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Send,
  TrendingUp,
  Check,
} from "lucide-react";

import { balanceApi, getErrorMessage } from "@/api";
import { LoginModal } from "@/components/molecules/loginModal";
import { useUser } from "@/contexts/UserContext";
import type { BalanceDetail as BalanceDetailType } from "@/types/balance.types";
import type { BalanceVoteOption } from "@/types/balance.types";

function getAgreeCountSafe(issue: BalanceDetailType) {
  const total = issue.totalVotes ?? 0;
  if (typeof (issue as any).agreeCount === "number")
    return (issue as any).agreeCount as number;
  const p = issue.agreePercent ?? 0;
  return Math.round((total * p) / 100);
}

function getMyLabelFromSession() {
  const s = getSession() as any;
  return (
    s?.user?.nickname ||
    s?.user?.email ||
    s?.user?.id ||
    s?.nickname ||
    s?.email ||
    s?.id ||
    "me"
  );
}

// ✅ 관리자 판정 강화 (세션 구조가 달라도 ADMIN이면 true)

// ✅ 관리자 식별(리스트와 동일): 화이트리스트 기반
const ADMIN_EMAILS = new Set<string>([
  "oct95@naver.com",
  "admin@test.com",
]);
const ADMIN_NICKNAMES = new Set<string>(["로운"].map((x) => x.toLowerCase()));
const ADMIN_USER_IDS = new Set<string>([
  "62968fae-154c-4d4f-91f4-abf4b67fd7c0", // 로운 userId (accessToken payload)
]);

/** JWT payload 디코드 (서명검증 X / 프론트 fallback 용) */
function decodeJwtPayload(token?: string | null): any | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** session/user/me 어디에 있든 userId/email/nickname 최대한 뽑기 */
function pickIdentityFromAnywhere(): {
  userId?: string;
  email?: string;
  nickname?: string;
} {
  const s = getSession() as any;

  // 1) session 쪽
  const sessionUserId =
    s?.user?.id || s?.userId || s?.id || s?.user?.userId || s?.profile?.id;
  const sessionEmail =
    s?.user?.email || s?.email || s?.userEmail || s?.profile?.email;
  const sessionNickname =
    s?.user?.nickname || s?.nickname || s?.userNickname || s?.profile?.nickname;

  if (sessionUserId || sessionEmail || sessionNickname) {
    return { userId: sessionUserId, email: sessionEmail, nickname: sessionNickname };
  }

  // 2) accessToken jwt payload
  const token = localStorage.getItem("accessToken") || undefined;
  const payload = decodeJwtPayload(token);

  const jwtUserId =
    payload?.userId ||
    payload?.sub ||
    payload?.user?.id ||
    payload?.data?.userId;

  const jwtEmail =
    payload?.email || payload?.user?.email || payload?.data?.email;

  const jwtNickname =
    payload?.nickname || payload?.user?.nickname || payload?.data?.nickname;

  return { userId: jwtUserId, email: jwtEmail, nickname: jwtNickname };
}

function isAdminByIdentity(input: {
  userId?: string;
  email?: string;
  nickname?: string;
}) {
  const uid = (input.userId ?? "").trim();
  const e = (input.email ?? "").toLowerCase().trim();
  const n = (input.nickname ?? "").toLowerCase().trim();

  if (uid && ADMIN_USER_IDS.has(uid)) return true;
  if (e && ADMIN_EMAILS.has(e)) return true;
  if (n && ADMIN_NICKNAMES.has(n)) return true;

  return false;
}

function parseJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isAdminNow() {
  const s = getSession() as any;

  // 1) 세션에서 먼저 체크
  const role =
    s?.user?.role ??
    s?.role ??
    s?.user?.authority ??
    s?.authority ??
    null;

  if (typeof role === "string") {
    const v = role.toUpperCase();
    if (v === "ADMIN" || v === "ROLE_ADMIN") return true;
  }

  const roles = s?.user?.roles ?? s?.roles ?? null;
  if (Array.isArray(roles)) {
    const up = roles.map((r) => String(r).toUpperCase());
    if (up.includes("ADMIN") || up.includes("ROLE_ADMIN")) return true;
  }

  if (s?.user?.isAdmin === true || s?.isAdmin === true) return true;
  if (String(s?.user?.isAdmin).toLowerCase() === "true") return true;
  if (String(s?.isAdmin).toLowerCase() === "true") return true;

  // 2) accessToken(JWT)에서 체크
  const token =
    (s?.accessToken as string) ||
    (s?.user?.accessToken as string) ||
    localStorage.getItem("accessToken") ||
    "";

  if (token) {
    const payload = parseJwtPayload(token);

    const jwtRole =
      payload?.role ??
      payload?.authority ??
      payload?.user?.role ??
      payload?.user?.authority ??
      null;

    if (typeof jwtRole === "string") {
      const v = jwtRole.toUpperCase();
      if (v === "ADMIN" || v === "ROLE_ADMIN") return true;
    }

    const jwtRoles =
      payload?.roles ??
      payload?.authorities ??
      payload?.user?.roles ??
      payload?.user?.authorities ??
      null;

    if (Array.isArray(jwtRoles)) {
      const up = jwtRoles.map((r: any) => String(r).toUpperCase());
      if (up.includes("ADMIN") || up.includes("ROLE_ADMIN")) return true;
    }

    const isAdmin =
      payload?.isAdmin ?? payload?.user?.isAdmin ?? payload?.admin ?? null;
    if (isAdmin === true) return true;
    if (String(isAdmin).toLowerCase() === "true") return true;
  }

  return false;
}

function getMyUserIdFromSession() {
  const s = getSession() as any;
  return s?.user?.id || s?.id || null;
}

function getMyNicknameFromSession() {
  const s = getSession() as any;
  return s?.user?.nickname || s?.nickname || null;
}

function getAuthorLabel(c: any) {
  if (c?.user?.nickname) return c.user.nickname;
  if (c?.user?.id) return c.user.id;

  if (c?.author === "me") return getMyLabelFromSession();
  if (typeof c?.author === "string" && c.author.trim() !== "") return c.author;

  if (c?.nickname) return c.nickname;

  return "익명";
}

function getDisagreeCountSafe(issue: BalanceDetailType) {
  const total = issue.totalVotes ?? 0;
  if (typeof (issue as any).disagreeCount === "number")
    return (issue as any).disagreeCount as number;
  const agree = getAgreeCountSafe(issue);
  return Math.max(0, total - agree);
}

function getTotalVotesSafe(issue: BalanceDetailType) {
  const anyIssue = issue as any;

  if (typeof anyIssue.totalVotes === "number") return anyIssue.totalVotes;
  if (typeof anyIssue.participants === "number") return anyIssue.participants;

  const agree = typeof anyIssue.agreeCount === "number" ? anyIssue.agreeCount : 0;
  const disagree =
    typeof anyIssue.disagreeCount === "number" ? anyIssue.disagreeCount : 0;

  return Math.max(0, agree + disagree);
}

function applyVoteOptimistic(
  issue: BalanceDetailType,
  prevVote: BalanceVoteOption | null,
  nextVote: BalanceVoteOption | null
): BalanceDetailType {
  let totalVotes = getTotalVotesSafe(issue);
  let agreeCount = getAgreeCountSafe(issue);
  let disagreeCount = getDisagreeCountSafe(issue);

  if (prevVote === "agree") {
    agreeCount -= 1;
    totalVotes -= 1;
  }
  if (prevVote === "disagree") {
    disagreeCount -= 1;
    totalVotes -= 1;
  }

  if (nextVote === "agree") {
    agreeCount += 1;
    totalVotes += 1;
  }
  if (nextVote === "disagree") {
    disagreeCount += 1;
    totalVotes += 1;
  }

  agreeCount = Math.max(0, agreeCount);
  disagreeCount = Math.max(0, disagreeCount);
  totalVotes = Math.max(0, totalVotes);

  const agreePercent =
    totalVotes === 0 ? 0 : Math.round((agreeCount / totalVotes) * 100);
  const disagreePercent = totalVotes === 0 ? 0 : Math.max(0, 100 - agreePercent);

  return {
    ...(issue as any),
    totalVotes,
    agreeCount,
    disagreeCount,
    agreePercent,
    disagreePercent,
  } as BalanceDetailType;
}

export function BalanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const { isAuthenticated } = useUser();

  const [selectedOption, setSelectedOption] = useState<BalanceVoteOption | null>(null);
  const [comment, setComment] = useState("");

  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const [issue, setIssue] = useState<BalanceDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isVoting, setIsVoting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const keyOf = (v: string | number) => String(v);

  const isLoggedIn = isAuthenticated || !!getSession();

  const isLoggedInNow = () =>
    isAuthenticated || !!getSession() || !!localStorage.getItem("accessToken");

  const openLoginModal = () => {
    setErrorMessage(null);
    setIsLoginModalOpen(true);
  };

  useEffect(() => {
  let mounted = true;

  (async () => {
    try {
      const fallback = pickIdentityFromAnywhere();
      if (!mounted) return;

      // ✅ 디테일은 리스트처럼 "화이트리스트"만 사용
      const nextAdmin = isAdminByIdentity(fallback);

      if (!mounted) return;
      setIsAdmin(nextAdmin);
    } catch (e) {
      console.warn("[BalanceDetail admin-check failed]", e);
    }
  })();

  return () => {
    mounted = false;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated]);

  const isRootCommentId = (commentId: string | number) => {
    const roots = ((issue as any)?.comments ?? []) as any[];
    return roots.some((c) => keyOf(c.id) === keyOf(commentId));
  };

  const handleDeleteComment = async (commentId: string | number) => {
    if (!issue) return;

    if (!isLoggedInNow()) {
      openLoginModal();
      return;
    }

    const commentIdNum =
      typeof commentId === "number" ? commentId : Number(commentId);
    if (Number.isNaN(commentIdNum)) return;

    try {
      await (balanceApi as any).deleteComment(issue.id, commentIdNum);

      const remove = (nodes: any[]): any[] => {
        return (nodes ?? [])
          .filter((n) => keyOf(n.id) !== keyOf(commentId))
          .map((n) => ({ ...n, replies: remove(n.replies ?? []) }));
      };

      setIssue((prev) =>
        prev
          ? ({ ...(prev as any), comments: remove((prev as any).comments) } as any)
          : prev
      );

      if (editingCommentId === keyOf(commentId)) handleCancelEdit();
      if (replyToId === keyOf(commentId)) handleCancelReply();
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const isMyComment = (c: any) => {
    const myId = getMyUserIdFromSession();
    const myNick = getMyNicknameFromSession();

    if (myId && c?.user?.id) return String(c.user.id) === String(myId);
    if (myNick && c?.user?.nickname)
      return String(c.user.nickname) === String(myNick);

    const authorLabel = getAuthorLabel(c);
    const myLabel = getMyLabelFromSession();
    return authorLabel === myLabel;
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const issueId = Number(id);
        if (!id || Number.isNaN(issueId)) throw new Error("잘못된 이슈 ID 입니다.");

        const data = await balanceApi.getBalanceDetail(issueId);
        if (!mounted) return;

        setIssue(data);
        setSelectedOption(isLoggedInNow() ? data.myVote : null);
      } catch (e) {
        if (!mounted) return;
        setErrorMessage(getErrorMessage(e));
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  // ✅ 투표: 1회만 허용
  const handleVote = async (option: BalanceVoteOption) => {
    if (!issue || isVoting) return;

    if (!isLoggedInNow()) {
      openLoginModal();
      return;
    }

    // ✅ 이미 투표했으면 변경/취소 불가
    if (selectedOption) return;

    const prevIssue = issue;
    const nextVote: BalanceVoteOption = option;

    const nextIssue = applyVoteOptimistic(prevIssue, null, nextVote);

    setSelectedOption(nextVote);
    setIssue(nextIssue);

    try {
      setIsVoting(true);
      setErrorMessage(null);
      await balanceApi.voteBalance(prevIssue.id, nextVote);
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
    openLoginModal();
    return;
  }

  if (!selectedOption) return;

  const content = comment.trim();
  if (!content) return;

  setComment("");

  try {
    const newComment = await balanceApi.createComment(issue.id, {
      content,
    } as any);

    // ✅ 새 댓글을 "맨 아래"로 붙이기
    setIssue((prev) => {
      if (!prev) return prev;
      const prevComments = ((prev as any).comments ?? []) as any[];
      return { ...prev, comments: [...prevComments, newComment] } as any;
    });
  } catch (e) {
    setErrorMessage(getErrorMessage(e));
  }
};

  const handleStartReply = (commentId: string | number, depth: number) => {
    if (!isLoggedInNow()) {
      openLoginModal();
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

  const handleCancelReply = () => {
    setReplyToId(null);
    setReplyContent("");
  };

  const handleSubmitReply = async (parentId: string | number) => {
    if (!issue) return;

    if (!isLoggedInNow()) {
      openLoginModal();
      return;
    }

    if (!selectedOption) return;

    if (!isRootCommentId(parentId)) {
      setErrorMessage("답글은 대댓글까지만 작성할 수 있어요.");
      return;
    }

    const parentKey = keyOf(parentId);
    const content = replyContent.trim();
    if (!content) return;

    const parentIdNum = typeof parentId === "number" ? parentId : Number(parentId);
    if (Number.isNaN(parentIdNum)) {
      setErrorMessage("답글 대상(parentId)이 올바르지 않습니다.");
      return;
    }

    setReplyContent("");
    setReplyToId(null);

    try {
      const newReply = await balanceApi.createComment(issue.id, {
        content,
        parentId: parentIdNum,
      } as any);

      const addReply = (nodes: any[]): any[] => {
        return (nodes ?? []).map((n) => {
          if (keyOf(n.id) === parentKey) {
            // ✅ 대댓글도 "맨 아래"로 붙이기
            return { ...n, replies: [...(n.replies ?? []), newReply] };
          }
          if (n.replies && n.replies.length > 0) {
            return { ...n, replies: addReply(n.replies) };
          }
          return n;
        });
      };

      setIssue((prev) => {
        if (!prev) return prev;
        return { ...(prev as any), comments: addReply((prev as any).comments) } as any;
      });

      setExpandedComments((prevSet) => {
        const next = new Set(prevSet);
        next.add(parentKey);
        return next;
      });
    } catch (e) {
      setReplyToId(null);
      setErrorMessage(getErrorMessage(e));
    }
  };

  const countAllComments = (nodes: any[]) => {
    let count = 0;
    for (const n of nodes ?? []) {
      count += 1;
      count += countAllComments(n.replies ?? []);
    }
    return count;
  };

  const toggleExpandReplies = (commentId: string | number) => {
    const k = keyOf(commentId);
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const handleToggleLike = async (commentId: string | number) => {
    if (!issue) return;

    if (!isLoggedInNow()) {
      openLoginModal();
      return;
    }

    const commentIdNum = typeof commentId === "number" ? commentId : Number(commentId);
    if (Number.isNaN(commentIdNum)) return;

    const prevIssue = issue;

    const patchLikes = (nodes: any[]): any[] => {
      return (nodes ?? []).map((n) => {
        if (keyOf(n.id) === keyOf(commentId)) {
          const prevLiked = !!n.isLiked;
          const nextLiked = !prevLiked;

          const prevCount = (n.likes ?? n.likeCount ?? 0) as number;
          const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

          return {
            ...n,
            likes: nextCount,
            likeCount: nextCount,
            isLiked: nextLiked,
          };
        }

        if (n.replies && n.replies.length > 0) {
          return { ...n, replies: patchLikes(n.replies) };
        }
        return n;
      });
    };

    const nextIssue = {
      ...(prevIssue as any),
      comments: patchLikes((prevIssue as any).comments),
    };
    setIssue(nextIssue as any);

    try {
      const res = await (balanceApi as any).toggleCommentLike(prevIssue.id, commentIdNum);

      const sync = (nodes: any[]): any[] => {
        return (nodes ?? []).map((n) => {
          if (keyOf(n.id) === keyOf(res.commentId)) {
            return {
              ...n,
              likes: res.likeCount,
              likeCount: res.likeCount,
              isLiked: res.isLiked,
            };
          }
          if (n.replies && n.replies.length > 0) {
            return { ...n, replies: sync(n.replies) };
          }
          return n;
        });
      };

      setIssue((cur) =>
        cur ? ({ ...(cur as any), comments: sync((cur as any).comments) } as any) : cur
      );
    } catch (e) {
      setIssue(prevIssue);
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleStartEdit = (c: any) => {
    if (!issue) return;

    if (!isLoggedInNow()) {
      openLoginModal();
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

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleSubmitEdit = async (commentId: string | number) => {
    if (!issue) return;

    if (!isLoggedInNow()) {
      openLoginModal();
      return;
    }

    const content = editingContent.trim();
    if (!content) return;

    const commentIdNum = typeof commentId === "number" ? commentId : Number(commentId);
    if (Number.isNaN(commentIdNum)) return;

    try {
      setErrorMessage(null);

      const updated = await (balanceApi as any).updateComment(issue.id, commentIdNum, {
        content,
      });

      const patchContent = (nodes: any[]): any[] => {
        return (nodes ?? []).map((n) => {
          if (keyOf(n.id) === keyOf(commentId)) {
            return {
              ...n,
              content: updated?.content ?? content,
            };
          }
          if (n.replies && n.replies.length > 0) {
            return { ...n, replies: patchContent(n.replies) };
          }
          return n;
        });
      };

      setIssue((prev) =>
        prev
          ? ({ ...(prev as any), comments: patchContent((prev as any).comments) } as any)
          : prev
      );

      setEditingCommentId(null);
      setEditingContent("");
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const renderCommentNode = (c: any, depth = 0) => {
    const hasReplies = (c.replies ?? []).length > 0;
    const isExpanded = expandedComments.has(keyOf(c.id));
    const isReply = depth > 0;

    const canReply = depth === 0;
    const canEdit = isLoggedInNow() && isMyComment(c);

    // ✅ 관리자면 남 댓글도 삭제 버튼 보임
    const canDelete = isLoggedInNow() && (isMyComment(c) || isAdmin);

    const isEditing = editingCommentId === keyOf(c.id);
    const isReplyBoxOpen = replyToId === keyOf(c.id);

    return (
      <div
        key={c.id}
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
            isReply ? "bg-white/[0.03] border-white/10" : "bg-white/5 border-white/10"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                c.option === "agree"
                  ? "bg-white/10 border border-white/20"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {c.option === "agree" ? (
                <ThumbsUp className="w-5 h-5" />
              ) : (
                <ThumbsDown className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold">{getAuthorLabel(c)}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.option === "agree"
                      ? "bg-white/10 text-white"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {c.option === "agree" ? "찬성" : "반대"}
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
                    placeholder="수정할 내용을 입력하세요..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmitEdit(c.id)}
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
                  onClick={() => handleToggleLike(c.id)}
                  className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${c.isLiked ? "text-white" : ""}`}
                    fill={c.isLiked ? "currentColor" : "none"}
                  />
                  <span className="font-medium">{c.likes ?? c.likeCount ?? 0}</span>
                </button>

                {canReply && !isEditing && (
                  <button
                    type="button"
                    onClick={() => handleStartReply(c.id, depth)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    답글
                  </button>
                )}

                {canEdit && !isEditing && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(c)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    수정
                  </button>
                )}

                {canDelete && !isEditing && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    삭제
                  </button>
                )}

                {hasReplies && (
                  <button
                    type="button"
                    onClick={() => toggleExpandReplies(c.id)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {isExpanded ? "답글 숨기기" : `답글 ${c.replies?.length}개`}
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
                    onFocus={() => {
                      if (!isLoggedInNow()) openLoginModal();
                    }}
                    onClick={() => {
                      if (!isLoggedInNow()) openLoginModal();
                    }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none text-white placeholder-gray-500 read-only:opacity-50 read-only:cursor-not-allowed"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmitReply(c.id)}
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
            {c.replies?.map((r: any) => renderCommentNode(r, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/balance"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">목록으로</span>
          </Link>
          <div className="text-gray-400">{errorMessage}</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-400">
          이슈를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const voteDisabled = isVoting;

  const agreeCountView = getAgreeCountSafe(issue);
  const disagreeCountView = getDisagreeCountSafe(issue);

  const totalVotesSafe = Math.max(
    0,
    (issue.totalVotes ?? agreeCountView + disagreeCountView) as number
  );
  const agreePercentBar =
    totalVotesSafe === 0
      ? 0
      : Math.round((agreeCountView / totalVotesSafe) * 100);
  const disagreePercentBar =
    totalVotesSafe === 0 ? 0 : Math.max(0, 100 - agreePercentBar);

  return (
    <div className="pt-16 min-h-screen bg-black text-white pb-24">
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={() => {
          setIsLoginModalOpen(false);
          navigate("/login");
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          to="/balance"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">목록으로</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-white/10 mb-8 overflow-hidden"
        >
          <div className="relative text-center">
            <div className="text-7xl sm:text-8xl lg:text-9xl mb-6 leading-none">
              {issue.emoji}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {issue.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {issue.description}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-white/10 mb-8 overflow-hidden"
        >
          <div className="relative">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-2xl sm:text-3xl font-bold">투표 현황</h2>
            </div>

            <div className="mb-8">
              <div
                className="relative bg-white/5 rounded-2xl overflow-hidden border border-white/10"
                style={{ height: 80 }}
              >
                <div
                  className={`absolute left-0 top-0 h-full bg-white flex items-center justify-start transition-all duration-500 overflow-hidden ${
                    agreePercentBar <= 0 ? "px-0" : "px-6 sm:px-8"
                  }`}
                  style={{ width: `${agreePercentBar}%` }}
                >
                  {agreePercentBar > 0 && (
                    <div className="text-black">
                      <div className="flex items-center space-x-2 mb-1">
                        <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-bold text-sm sm:text-lg">찬성</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold">
                        {agreePercentBar}%
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`absolute right-0 top-0 h-full bg-gray-800 flex items-center justify-end transition-all duration-500 overflow-hidden ${
                    disagreePercentBar <= 0 ? "px-0" : "px-6 sm:px-8"
                  }`}
                  style={{ width: `${disagreePercentBar}%` }}
                >
                  {disagreePercentBar > 0 && (
                    <div className="text-white text-right">
                      <div className="flex items-center justify-end space-x-2 mb-1">
                        <span className="font-bold text-sm sm:text-lg">반대</span>
                        <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold">
                        {disagreePercentBar}%
                      </div>
                    </div>
                  )}
                </div>

                {totalVotesSafe === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                    아직 투표가 없어요
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-sm text-gray-400 font-semibold mb-2">
                    찬성 인원
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {agreeCountView.toLocaleString()}명
                  </div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-sm text-gray-400 font-semibold mb-2">
                    반대 인원
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {disagreeCountView.toLocaleString()}명
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center">당신의 선택은?</h3>

              {!isLoggedIn && (
                <div className="mb-4 text-center text-sm text-gray-400">
                  로그인 후 투표할 수 있어요.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVote("agree")}
                  disabled={voteDisabled}
                  className={`relative p-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    selectedOption === "agree"
                      ? "bg-white text-black border-2 border-white"
                      : "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <ThumbsUp className="w-8 h-8" />
                    <span className="font-bold text-lg">찬성</span>
                    {selectedOption === "agree" && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Check className="w-4 h-4" />
                        <span>선택됨</span>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleVote("disagree")}
                  disabled={voteDisabled}
                  className={`relative p-6 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    selectedOption === "disagree"
                      ? "bg-white text-black border-2 border-white"
                      : "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <ThumbsDown className="w-8 h-8" />
                    <span className="font-bold text-lg">반대</span>
                    {selectedOption === "disagree" && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Check className="w-4 h-4" />
                        <span>선택됨</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center py-4 mt-6 border-t border-white/10">
              <p className="text-gray-400">
                총{" "}
                <span className="font-bold text-white text-lg">
                  {(issue.totalVotes ?? 0).toLocaleString()}명
                </span>
                이 참여했습니다
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 border-2 border-white/10 overflow-hidden"
        >
          <div className="relative">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              댓글 {countAllComments((issue as any).comments)}개
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
                    onFocus={() => {
                      if (!isLoggedInNow()) openLoginModal();
                    }}
                    onClick={() => {
                      if (!isLoggedInNow()) openLoginModal();
                    }}
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
              {(issue as any).comments?.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  아직 댓글이 없어요. 첫 댓글을 남겨보세요!
                </div>
              ) : (
                [...((issue as any).comments ?? [])].map((c: any) => renderCommentNode(c, 0))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


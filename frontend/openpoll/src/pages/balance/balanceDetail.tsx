import { useEffect, useMemo, useState } from "react";
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

import { issueApi, getErrorMessage, userApi } from "@/api";
import { LoginModal } from "@/components/molecules/loginModal";
import { useUser } from "@/contexts/UserContext";
import type { IssueDetail as IssueDetailType, IssueVoteOption } from "@/types/balance.types";

/** =========================
 *  utils
 *  ========================= */

type LocalAuthSession = {
  user?: {
    id?: string | number | null;
    nickname?: string | null;
    email?: string | null;
  } | null;
  id?: string | number | null;
  nickname?: string | null;
  email?: string | null;
} | null;

type CommentNode = {
  id: string | number;
  content?: string;
  createdAt?: string;
  option?: IssueVoteOption;
  likes?: number;
  likeCount?: number;
  isLiked?: boolean;
  user?: {
    id?: string | number | null;
    nickname?: string | null;
  } | null;
  replies?: CommentNode[];
};

const adminEmailList = ["oct95@naver.com", "admin@test.com"] as const;
const adminEmails = new Set<string>(adminEmailList.map((email) => email.trim().toLowerCase()));

function isAdminEmail(email?: string | null): boolean {
  return adminEmails.has((email ?? "").trim().toLowerCase());
}

function keyOf(v: string | number) {
  return String(v);
}

function getMyLabelFromSession(): string {
  const session = getSession() as LocalAuthSession;
  return (
    session?.user?.nickname?.trim() ||
    session?.user?.email?.trim() ||
    session?.nickname?.trim() ||
    session?.email?.trim() ||
    "me"
  );
}

function getMyUserIdFromSession(): string | null {
  const s = getSession() as LocalAuthSession;
  if (s?.user?.id != null) return String(s.user.id);
  if (s?.id != null) return String(s.id);
  return null;
}

function getMyNicknameFromSession(): string | null {
  const s = getSession() as LocalAuthSession;
  return s?.user?.nickname?.trim() || s?.nickname?.trim() || null;
}

function getAuthorLabel(c: { user?: { nickname?: string | null } | null }) {
  return c.user?.nickname?.trim() || "익명";
}

function getAgreeCountSafe(issue: IssueDetailType): number {
  const total = issue.totalVotes ?? 0;
  if (typeof issue.agreeCount === "number") return issue.agreeCount;
  const percent = issue.agreePercent ?? 0;
  return Math.round((total * percent) / 100);
}

function getDisagreeCountSafe(issue: IssueDetailType): number {
  const total = issue.totalVotes ?? 0;
  if (typeof issue.disagreeCount === "number") return issue.disagreeCount;
  const agree = getAgreeCountSafe(issue);
  return Math.max(0, total - agree);
}

function getTotalVotesSafe(issue: IssueDetailType): number {
  if (typeof issue.totalVotes === "number") return issue.totalVotes;
  if (typeof issue.participants === "number") return issue.participants;

  const agree = typeof issue.agreeCount === "number" ? issue.agreeCount : 0;
  const disagree = typeof issue.disagreeCount === "number" ? issue.disagreeCount : 0;

  return Math.max(0, agree + disagree);
}

function applyVoteOptimistic(
  issue: IssueDetailType,
  prevVote: IssueVoteOption | null,
  nextVote: IssueVoteOption | null
): IssueDetailType {
  let totalVotes = getTotalVotesSafe(issue);
  let agreeCount = getAgreeCountSafe(issue);
  let disagreeCount = getDisagreeCountSafe(issue);

  if (prevVote === "agree") {
    agreeCount -= 1;
    totalVotes -= 1;
  } else if (prevVote === "disagree") {
    disagreeCount -= 1;
    totalVotes -= 1;
  }

  if (nextVote === "agree") {
    agreeCount += 1;
    totalVotes += 1;
  } else if (nextVote === "disagree") {
    disagreeCount += 1;
    totalVotes += 1;
  }

  agreeCount = Math.max(0, agreeCount);
  disagreeCount = Math.max(0, disagreeCount);
  totalVotes = Math.max(0, totalVotes);

  const agreePercent = totalVotes === 0 ? 0 : Math.round((agreeCount / totalVotes) * 100);
  const disagreePercent = totalVotes === 0 ? 0 : Math.max(0, 100 - agreePercent);

  return {
    ...issue,
    totalVotes,
    agreeCount,
    disagreeCount,
    agreePercent,
    disagreePercent,
  };
}

/** comment tree utils */
function removeCommentFromTree(nodes: CommentNode[], commentId: string | number): CommentNode[] {
  return (nodes ?? [])
    .filter((n) => keyOf(n.id) !== keyOf(commentId))
    .map((n) => ({ ...n, replies: removeCommentFromTree(n.replies ?? [], commentId) }));
}

function addReplyToTree(
  nodes: CommentNode[],
  parentId: string | number,
  newReply: CommentNode
): CommentNode[] {
  return (nodes ?? []).map((n) => {
    if (keyOf(n.id) === keyOf(parentId)) {
      return { ...n, replies: [...(n.replies ?? []), newReply] };
    }
    if ((n.replies ?? []).length > 0) {
      return { ...n, replies: addReplyToTree(n.replies ?? [], parentId, newReply) };
    }
    return n;
  });
}

function patchLikeOptimistic(nodes: CommentNode[], commentId: string | number): CommentNode[] {
  return (nodes ?? []).map((n) => {
    if (keyOf(n.id) === keyOf(commentId)) {
      const prevLiked = !!n.isLiked;
      const nextLiked = !prevLiked;
      const prevCount = (n.likes ?? n.likeCount ?? 0) as number;
      const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));
      return { ...n, likes: nextCount, likeCount: nextCount, isLiked: nextLiked };
    }
    if ((n.replies ?? []).length > 0) {
      return { ...n, replies: patchLikeOptimistic(n.replies ?? [], commentId) };
    }
    return n;
  });
}

function patchLikeFromServer(
  nodes: CommentNode[],
  targetId: string | number,
  likeCount: number,
  isLiked: boolean
): CommentNode[] {
  return (nodes ?? []).map((n) => {
    if (keyOf(n.id) === keyOf(targetId)) {
      return { ...n, likes: likeCount, likeCount, isLiked };
    }
    if ((n.replies ?? []).length > 0) {
      return { ...n, replies: patchLikeFromServer(n.replies ?? [], targetId, likeCount, isLiked) };
    }
    return n;
  });
}

function patchContentInTree(
  nodes: CommentNode[],
  commentId: string | number,
  content: string
): CommentNode[] {
  return (nodes ?? []).map((n) => {
    if (keyOf(n.id) === keyOf(commentId)) return { ...n, content };
    if ((n.replies ?? []).length > 0) {
      return { ...n, replies: patchContentInTree(n.replies ?? [], commentId, content) };
    }
    return n;
  });
}

function countAllComments(nodes: CommentNode[]): number {
  let count = 0;
  for (const n of nodes ?? []) {
    count += 1;
    count += countAllComments(n.replies ?? []);
  }
  return count;
}

/** =========================
 *  view-model hook
 *  ========================= */

type IssueDetailVm = {
  navigate: ReturnType<typeof useNavigate>;
  issue: IssueDetailType | null;
  isLoading: boolean;
  errorMessage: string | null;

  isAdmin: boolean;
  isVoting: boolean;
  isLoggedIn: boolean;
  isLoginModalOpen: boolean;
  selectedOption: IssueVoteOption | null;

  comment: string;
  setComment: (value: string) => void;

  replyToId: string | null;
  replyContent: string;
  setReplyContent: (value: string) => void;

  editingCommentId: string | null;
  editingContent: string;
  setEditingContent: (value: string) => void;

  expandedComments: Set<string>;

  openLoginModal: () => void;
  closeLoginModal: () => void;

  handleVote: (option: IssueVoteOption) => Promise<void>;
  handleSubmitComment: () => Promise<void>;

  handleStartReply: (commentId: string | number, depth: number) => void;
  handleCancelReply: () => void;
  handleSubmitReply: (parentId: string | number) => Promise<void>;

  handleToggleLike: (commentId: string | number) => Promise<void>;

  handleStartEdit: (c: CommentNode) => void;
  handleCancelEdit: () => void;
  handleSubmitEdit: (commentId: string | number) => Promise<void>;

  handleDeleteComment: (commentId: string | number) => Promise<void>;

  toggleExpandReplies: (commentId: string | number) => void;
  isMyComment: (c: CommentNode) => boolean;

  agreeCountView: number;
  disagreeCountView: number;
  totalVotesSafe: number;
  agreePercentBar: number;
  disagreePercentBar: number;
};

function useIssueDetailState(): IssueDetailVm {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedOption, setSelectedOption] = useState<IssueVoteOption | null>(null);

  const [comment, setCommentState] = useState("");

  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContentState] = useState("");

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContentState] = useState("");

  const [issue, setIssue] = useState<IssueDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isVoting, setIsVoting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isLoggedIn = isAuthenticated || !!getSession();
  const isLoggedInNow = () => isAuthenticated || !!getSession() || !!localStorage.getItem("accessToken");

  const openLoginModal = () => {
    setErrorMessage(null);
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const setComment = (value: string) => setCommentState(value);
  const setReplyContent = (value: string) => setReplyContentState(value);
  const setEditingContent = (value: string) => setEditingContentState(value);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!isAuthenticated) {
          if (mounted) setIsAdmin(false);
          return;
        }
        const me = await userApi.getMe();
        if (!mounted) return;
        setIsAdmin(isAdminEmail(me?.email));
      } catch (e) {
        if (!mounted) return;
        setIsAdmin(false);
        console.warn("[IssueDetail admin-check failed]", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const issueId = Number(id);
        if (!id || Number.isNaN(issueId)) throw new Error("잘못된 이슈 ID 입니다.");

        const data = await issueApi.getIssueDetail(issueId);
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
  }, [id, isAuthenticated]);

  const isRootCommentId = (commentId: string | number) => {
    const roots = (((issue as any)?.comments ?? []) as CommentNode[]);
    return roots.some((c) => keyOf(c.id) === keyOf(commentId));
  };

  const isMyComment = (c: CommentNode) => {
    const myId = getMyUserIdFromSession();
    const myNick = getMyNicknameFromSession();

    if (myId && c?.user?.id) return String(c.user.id) === String(myId);
    if (myNick && c?.user?.nickname) return String(c.user.nickname) === String(myNick);

    const authorLabel = getAuthorLabel(c);
    const myLabel = getMyLabelFromSession();
    return authorLabel === myLabel;
  };

  const handleVote = async (option: IssueVoteOption) => {
    if (!issue || isVoting) return;
    if (!isLoggedInNow()) {
      openLoginModal();
      return;
    }
    if (selectedOption) return; 

    const prevIssue = issue;
    const nextVote: IssueVoteOption = option;
    const nextIssue = applyVoteOptimistic(prevIssue, null, nextVote);

    setSelectedOption(nextVote);
    setIssue(nextIssue);

    try {
      setIsVoting(true);
      setErrorMessage(null);
      await issueApi.voteIssue(prevIssue.id, nextVote);
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

    setCommentState("");

    try {
      const newComment = await issueApi.createComment(issue.id, { content } as any);
      setIssue((prev) => {
        if (!prev) return prev;
        const prevComments = (((prev as any).comments ?? []) as CommentNode[]);
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
    setEditingContentState("");
    setReplyToId(keyOf(commentId));
    setReplyContentState("");
  };

  const handleCancelReply = () => {
    setReplyToId(null);
    setReplyContentState("");
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

    const content = replyContent.trim();
    if (!content) return;

    const parentIdNum = typeof parentId === "number" ? parentId : Number(parentId);
    if (Number.isNaN(parentIdNum)) {
      setErrorMessage("답글 대상(parentId)이 올바르지 않습니다.");
      return;
    }

    setReplyContentState("");
    setReplyToId(null);

    try {
      const newReply = (await issueApi.createComment(issue.id, {
        content,
        parentId: parentIdNum,
      } as any)) as CommentNode;

      setIssue((prev) => {
        if (!prev) return prev;
        return {
          ...(prev as any),
          comments: addReplyToTree(
            (((prev as any).comments ?? []) as CommentNode[]),
            parentIdNum, 
            newReply
          ),
        } as any;
      });

      setExpandedComments((prevSet) => {
        const next = new Set(prevSet);
        next.add(keyOf(parentId));
        return next;
      });
    } catch (e) {
      setReplyToId(null);
      setErrorMessage(getErrorMessage(e));
    }
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

    setIssue({
      ...(prevIssue as any),
      comments: patchLikeOptimistic((((prevIssue as any).comments ?? []) as CommentNode[]), commentId),
    } as any);

    try {
      const res = await (issueApi as any).toggleCommentLike(prevIssue.id, commentIdNum);

      setIssue((cur) =>
        cur
          ? ({
              ...(cur as any),
              comments: patchLikeFromServer(
                (((cur as any).comments ?? []) as CommentNode[]),
                res.commentId,
                res.likeCount,
                res.isLiked
              ),
            } as any)
          : cur
      );
    } catch (e) {
      setIssue(prevIssue);
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleStartEdit = (c: CommentNode) => {
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
    setReplyContentState("");

    setEditingCommentId(keyOf(c.id));
    setEditingContentState(String(c.content ?? ""));
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContentState("");
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

      const updated = await (issueApi as any).updateComment(issue.id, commentIdNum, { content });

      setIssue((prev) =>
        prev
          ? ({
              ...(prev as any),
              comments: patchContentInTree(
                (((prev as any).comments ?? []) as CommentNode[]),
                commentId,
                updated?.content ?? content
              ),
            } as any)
          : prev
      );

      setEditingCommentId(null);
      setEditingContentState("");
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
  };

  const handleDeleteComment = async (commentId: string | number) => {
    if (!issue) return;
    if (!isLoggedInNow()) {
      openLoginModal();
      return;
    }

    const commentIdNum = typeof commentId === "number" ? commentId : Number(commentId);
    if (Number.isNaN(commentIdNum)) return;

    try {
      await (issueApi as any).deleteComment(issue.id, commentIdNum);

      setIssue((prev) =>
        prev
          ? ({
              ...(prev as any),
              comments: removeCommentFromTree((((prev as any).comments ?? []) as CommentNode[]), commentId),
            } as any)
          : prev
      );

      if (editingCommentId === keyOf(commentId)) handleCancelEdit();
      if (replyToId === keyOf(commentId)) handleCancelReply();
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    }
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

  const agreeCountView = useMemo(() => (issue ? getAgreeCountSafe(issue) : 0), [issue]);
  const disagreeCountView = useMemo(() => (issue ? getDisagreeCountSafe(issue) : 0), [issue]);

  const totalVotesSafe = useMemo(
    () => Math.max(0, issue ? ((issue.totalVotes ?? agreeCountView + disagreeCountView) as number) : 0),
    [issue, agreeCountView, disagreeCountView]
  );

  const agreePercentBar = useMemo(
    () => (totalVotesSafe === 0 ? 0 : Math.round((agreeCountView / totalVotesSafe) * 100)),
    [totalVotesSafe, agreeCountView]
  );

  const disagreePercentBar = useMemo(
    () => (totalVotesSafe === 0 ? 0 : Math.max(0, 100 - agreePercentBar)),
    [totalVotesSafe, agreePercentBar]
  );

  return {
    navigate,
    issue,
    isLoading,
    errorMessage,
    isAdmin,
    isVoting,
    isLoggedIn,
    isLoginModalOpen,
    selectedOption,
    comment,
    setComment,
    replyToId,
    replyContent,
    setReplyContent,
    editingCommentId,
    editingContent,
    setEditingContent,
    expandedComments,
    openLoginModal,
    closeLoginModal,
    handleVote,
    handleSubmitComment,
    handleStartReply,
    handleCancelReply,
    handleSubmitReply,
    handleToggleLike,
    handleStartEdit,
    handleCancelEdit,
    handleSubmitEdit,
    handleDeleteComment,
    toggleExpandReplies,
    isMyComment,
    agreeCountView,
    disagreeCountView,
    totalVotesSafe,
    agreePercentBar,
    disagreePercentBar,
  };
}

/** =========================
 *  sections
 *  ========================= */

function IssueHeaderSection({ issue }: { issue: IssueDetailType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-white/10 mb-8 overflow-hidden"
    >
      <div className="relative text-center">
        <div className="text-7xl sm:text-8xl lg:text-9xl mb-6 leading-none">{issue.emoji}</div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{issue.title}</h1>
        <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
          {issue.description}
        </p>
      </div>
    </motion.div>
  );
}

type VoteSectionProps = {
  issue: IssueDetailType;
  isLoggedIn: boolean;
  isVoting: boolean;
  selectedOption: IssueVoteOption | null;
  agreeCountView: number;
  disagreeCountView: number;
  agreePercentBar: number;
  disagreePercentBar: number;
  totalVotesSafe: number;
  onVote: (option: IssueVoteOption) => void;
};

function IssueVoteSection(props: VoteSectionProps) {
  const {
    issue,
    isLoggedIn,
    isVoting,
    selectedOption,
    agreeCountView,
    disagreeCountView,
    agreePercentBar,
    disagreePercentBar,
    totalVotesSafe,
    onVote,
  } = props;

  return (
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
          <div className="relative bg-white/5 rounded-2xl overflow-hidden border border-white/10" style={{ height: 80 }}>
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
                  <div className="text-2xl sm:text-3xl font-bold">{agreePercentBar}%</div>
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
                  <div className="text-2xl sm:text-3xl font-bold">{disagreePercentBar}%</div>
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
              <div className="text-sm text-gray-400 font-semibold mb-2">찬성 인원</div>
              <div className="text-2xl sm:text-3xl font-bold">{agreeCountView.toLocaleString()}명</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-sm text-gray-400 font-semibold mb-2">반대 인원</div>
              <div className="text-2xl sm:text-3xl font-bold">{disagreeCountView.toLocaleString()}명</div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <h3 className="text-xl font-bold mb-4 text-center">당신의 선택은?</h3>
          {!isLoggedIn && <div className="mb-4 text-center text-sm text-gray-400">로그인 후 투표할 수 있어요.</div>}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onVote("agree")}
              disabled={isVoting}
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
              onClick={() => onVote("disagree")}
              disabled={isVoting}
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
            총 <span className="font-bold text-white text-lg">{(issue.totalVotes ?? 0).toLocaleString()}명</span>이 참여했습니다
          </p>
        </div>
      </div>
    </motion.div>
  );
}

type CommentSectionProps = {
  issue: IssueDetailType;
  isAdmin: boolean;
  isLoggedIn: boolean;
  selectedOption: IssueVoteOption | null;
  comment: string;
  onChangeComment: (value: string) => void;
  onSubmitComment: () => void;

  replyToId: string | null;
  replyContent: string;
  onChangeReplyContent: (value: string) => void;
  onStartReply: (commentId: string | number, depth: number) => void;
  onCancelReply: () => void;
  onSubmitReply: (commentId: string | number) => void;

  editingCommentId: string | null;
  editingContent: string;
  onChangeEditingContent: (value: string) => void;
  onStartEdit: (c: CommentNode) => void;
  onCancelEdit: () => void;
  onSubmitEdit: (commentId: string | number) => void;

  onToggleLike: (commentId: string | number) => void;
  onDeleteComment: (commentId: string | number) => void;

  expandedComments: Set<string>;
  onToggleExpandReplies: (commentId: string | number) => void;

  isMyComment: (c: CommentNode) => boolean;
  onRequireLogin: () => void;
};

function IssueCommentSection(props: CommentSectionProps) {
  const {
    issue,
    isAdmin,
    isLoggedIn,
    selectedOption,
    comment,
    onChangeComment,
    onSubmitComment,
    replyToId,
    replyContent,
    onChangeReplyContent,
    onStartReply,
    onCancelReply,
    onSubmitReply,
    editingCommentId,
    editingContent,
    onChangeEditingContent,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
    onToggleLike,
    onDeleteComment,
    expandedComments,
    onToggleExpandReplies,
    isMyComment,
    onRequireLogin,
  } = props;

  const comments = (((issue as any).comments ?? []) as CommentNode[]);

  const renderCommentNode = (c: CommentNode, depth = 0): React.ReactNode => {
    const hasReplies = (c.replies ?? []).length > 0;
    const isExpanded = expandedComments.has(keyOf(c.id));
    const isReply = depth > 0;

    const canReply = depth === 0;
    const canEdit = isLoggedIn && isMyComment(c);
    const canDelete = isLoggedIn && (isMyComment(c) || isAdmin);

    const isEditing = editingCommentId === keyOf(c.id);
    const isReplyBoxOpen = replyToId === keyOf(c.id);

    return (
      <div key={keyOf(c.id)} className={isReply ? "relative" : ""} style={{ paddingLeft: isReply ? "32px" : "0" }}>
        {isReply && (
          <>
            <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: "16px" }} />
            <div className="absolute h-px bg-white/20" style={{ left: "16px", top: "24px", width: "16px" }} />
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
                c.option === "agree" ? "bg-white/10 border border-white/20" : "bg-white/5 border border-white/10"
              }`}
            >
              {c.option === "agree" ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold">{getAuthorLabel(c)}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.option === "agree" ? "bg-white/10 text-white" : "bg-white/5 text-gray-400"
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
                    onChange={(e) => onChangeEditingContent(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none text-white placeholder-gray-500"
                    rows={3}
                    placeholder="수정할 내용을 입력하세요..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={onCancelEdit}
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
                <p className="text-gray-300 leading-relaxed mb-3 text-sm sm:text-base">{c.content}</p>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onToggleLike(c.id)}
                  className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Heart className={`w-4 h-4 ${c.isLiked ? "text-white" : ""}`} fill={c.isLiked ? "currentColor" : "none"} />
                  <span className="font-medium">{c.likes ?? c.likeCount ?? 0}</span>
                </button>

                {canReply && !isEditing && (
                  <button type="button" onClick={() => onStartReply(c.id, depth)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    답글
                  </button>
                )}

                {canEdit && !isEditing && (
                  <button type="button" onClick={() => onStartEdit(c)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    수정
                  </button>
                )}

                {canDelete && !isEditing && (
                  <button type="button" onClick={() => onDeleteComment(c.id)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    삭제
                  </button>
                )}

                {hasReplies && (
                  <button type="button" onClick={() => onToggleExpandReplies(c.id)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {isExpanded ? "답글 숨기기" : `답글 ${c.replies?.length}개`}
                  </button>
                )}
              </div>

              {isReplyBoxOpen && canReply && !isEditing && (
                <div className="mt-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => onChangeReplyContent(e.target.value)}
                    placeholder={
                      !isLoggedIn ? "로그인 후 답글을 작성할 수 있어요" : selectedOption ? "답글을 남겨주세요..." : "투표 후 답글을 작성할 수 있어요"
                    }
                    readOnly={!isLoggedIn || !selectedOption}
                    onFocus={() => !isLoggedIn && onRequireLogin()}
                    onClick={() => !isLoggedIn && onRequireLogin()}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none text-white placeholder-gray-500 read-only:opacity-50 read-only:cursor-not-allowed"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={onCancelReply}
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

        {hasReplies && isExpanded && <div className="mt-3 space-y-3">{c.replies?.map((r) => renderCommentNode(r, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-8 border-2 border-white/10 overflow-hidden"
    >
      <div className="relative">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">댓글 {countAllComments(comments)}개</h2>

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
              {selectedOption === "agree" ? <ThumbsUp className="w-5 h-5" /> : selectedOption === "disagree" ? <ThumbsDown className="w-5 h-5" /> : <span className="text-xs">?</span>}
            </div>

            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => onChangeComment(e.target.value)}
                placeholder={!isLoggedIn ? "로그인 후 댓글을 작성할 수 있어요" : selectedOption ? "의견을 남겨주세요..." : "투표 후 댓글을 작성할 수 있어요"}
                readOnly={!isLoggedIn || !selectedOption}
                onFocus={() => !isLoggedIn && onRequireLogin()}
                onClick={() => !isLoggedIn && onRequireLogin()}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 resize-none text-white placeholder-gray-500 read-only:opacity-50 read-only:cursor-not-allowed"
                rows={3}
              />

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {!isLoggedIn ? "⚠️ 로그인 필요" : !selectedOption ? "⚠️ 투표를 먼저 해주세요" : ""}
                </span>

                <button
                  onClick={onSubmitComment}
                  disabled={!selectedOption || !comment.trim()}
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
            <div className="text-gray-500 text-sm">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</div>
          ) : (
            comments.map((c) => renderCommentNode(c, 0))
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** =========================
 *  page(container)
 *  ========================= */

export function IssueDetail() {
  const vm = useIssueDetailState();

  if (vm.isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-400">불러오는 중...</div>
      </div>
    );
  }

  if (vm.errorMessage) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/balance" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">목록으로</span>
          </Link>
          <div className="text-gray-400">{vm.errorMessage}</div>
        </div>
      </div>
    );
  }

  if (!vm.issue) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-400">이슈를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-black text-white pb-24">
      <LoginModal
        isOpen={vm.isLoginModalOpen}
        onClose={vm.closeLoginModal}
        onLogin={() => {
          vm.closeLoginModal();
          vm.navigate("/login");
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link to="/balance" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">목록으로</span>
        </Link>

        <IssueHeaderSection issue={vm.issue} />

        <IssueVoteSection
          issue={vm.issue}
          isLoggedIn={vm.isLoggedIn}
          isVoting={vm.isVoting}
          selectedOption={vm.selectedOption}
          agreeCountView={vm.agreeCountView}
          disagreeCountView={vm.disagreeCountView}
          totalVotesSafe={vm.totalVotesSafe}
          agreePercentBar={vm.agreePercentBar}
          disagreePercentBar={vm.disagreePercentBar}
          onVote={(option) => void vm.handleVote(option)}
        />

        <IssueCommentSection
          issue={vm.issue}
          isAdmin={vm.isAdmin}
          isLoggedIn={vm.isLoggedIn}
          selectedOption={vm.selectedOption}
          comment={vm.comment}
          onChangeComment={vm.setComment}
          onSubmitComment={() => void vm.handleSubmitComment()}
          replyToId={vm.replyToId}
          replyContent={vm.replyContent}
          onChangeReplyContent={vm.setReplyContent}
          onStartReply={vm.handleStartReply}
          onCancelReply={vm.handleCancelReply}
          onSubmitReply={(commentId) => void vm.handleSubmitReply(commentId)}
          editingCommentId={vm.editingCommentId}
          editingContent={vm.editingContent}
          onChangeEditingContent={vm.setEditingContent}
          onStartEdit={vm.handleStartEdit}
          onCancelEdit={vm.handleCancelEdit}
          onSubmitEdit={(commentId) => void vm.handleSubmitEdit(commentId)}
          onToggleLike={(commentId) => void vm.handleToggleLike(commentId)}
          onDeleteComment={(commentId) => void vm.handleDeleteComment(commentId)}
          expandedComments={vm.expandedComments}
          onToggleExpandReplies={vm.toggleExpandReplies}
          isMyComment={vm.isMyComment}
          onRequireLogin={vm.openLoginModal}
        />
      </div>
    </div>
  );
}
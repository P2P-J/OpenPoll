import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

import { LoginModal } from "@/components/molecules/loginModal";
import { Toast } from "@/components/molecules/toast/Toast";
import { useBalanceDetail } from "./hooks/useBalanceDetail";
import {
  BalanceDetailHero,
  BalanceVoteSection,
  BalanceCommentSection,
} from "./components";
import {
  keyOf,
  pickIdentityFromAnywhere,
  isAdminByIdentity,
  getMyUserIdFromSession,
  getMyNicknameFromSession,
  getAuthorLabel,
  getMyLabelFromSession,
  getAgreeCountSafe,
  getDisagreeCountSafe,
} from "@/shared/utils/balanceHelpers";
import type { BalanceComment } from "@/types/balance.types";

export function BalanceDetail() {
  const { id } = useParams();

  const vm = useBalanceDetail(id);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  usePageMeta(
    vm.issue ? `${vm.issue.title} - 밸런스 게임` : "밸런스 게임 상세",
    vm.issue?.description,
  );

  const isAdmin = useMemo(() => {
    const fallback = pickIdentityFromAnywhere();
    return isAdminByIdentity(fallback);
  }, []);

  const isMyComment = (c: BalanceComment) => {
    const myId = getMyUserIdFromSession();
    const myNick = getMyNicknameFromSession();

    if (myId && c?.user?.id) return String(c.user.id) === String(myId);
    if (myNick && c?.user?.nickname)
      return String(c.user.nickname) === String(myNick);

    return getAuthorLabel(c) === getMyLabelFromSession();
  };

  const toggleExpandReplies = (commentId: string | number) => {
    const k = keyOf(commentId);
    vm.setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const openLoginModal = () => {
    vm.setIsLoginModalOpen(true);
  };

  const handleVote = (option: "agree" | "disagree") => {
    if (vm.selectedOption) {
      setToastMessage("이미 투표에 참여하셨습니다.");
      setToastType("info");
      setShowToast(true);
      return;
    }
    vm.handleVote(option);
  };

  if (vm.isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (vm.errorMessage) {
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
          <div className="text-gray-400">{vm.errorMessage}</div>
        </div>
      </div>
    );
  }

  if (!vm.issue) {
    return (
      <div className="pt-16 min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-400">
          이슈를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const agreeCountView = getAgreeCountSafe(vm.issue);
  const disagreeCountView = getDisagreeCountSafe(vm.issue);
  const totalVotesSafe = Math.max(
    0,
    Number(vm.issue.totalVotes ?? agreeCountView + disagreeCountView),
  );
  const agreePercentBar =
    totalVotesSafe === 0
      ? 0
      : Math.round((agreeCountView / totalVotesSafe) * 100);
  const disagreePercentBar =
    totalVotesSafe === 0 ? 0 : Math.max(0, 100 - agreePercentBar);

  return (
    <div className="pt-16 min-h-screen bg-black text-white pb-24">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <LoginModal
        isOpen={vm.isLoginModalOpen}
        onClose={() => vm.setIsLoginModalOpen(false)}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          to="/balance"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">목록으로</span>
        </Link>

        <BalanceDetailHero issue={vm.issue} />

        <BalanceVoteSection
          isLoggedIn={vm.isLoggedIn}
          isVoting={vm.isVoting}
          selectedOption={vm.selectedOption}
          agreeCountView={agreeCountView}
          disagreeCountView={disagreeCountView}
          totalVotesSafe={totalVotesSafe}
          agreePercentBar={agreePercentBar}
          disagreePercentBar={disagreePercentBar}
          onVote={handleVote}
        />

        <BalanceCommentSection
          isLoggedIn={vm.isLoggedIn}
          isLoggedInNow={vm.isLoggedInNow}
          selectedOption={vm.selectedOption}
          comment={vm.comment}
          setComment={vm.setComment}
          comments={vm.comments}
          openLoginModal={openLoginModal}
          isAdmin={isAdmin}
          isMyComment={isMyComment}
          expandedComments={vm.expandedComments}
          editingCommentId={vm.editingCommentId}
          editingContent={vm.editingContent}
          replyToId={vm.replyToId}
          replyContent={vm.replyContent}
          setEditingCommentId={vm.setEditingCommentId}
          setEditingContent={vm.setEditingContent}
          setReplyToId={vm.setReplyToId}
          setReplyContent={vm.setReplyContent}
          handleStartReply={vm.handleStartReply}
          handleSubmitReply={vm.handleSubmitReply}
          handleStartEdit={vm.handleStartEdit}
          handleSubmitEdit={vm.handleSubmitEdit}
          handleDeleteComment={vm.handleDeleteComment}
          handleToggleLike={vm.handleToggleLike}
          toggleExpandReplies={toggleExpandReplies}
          handleSubmitComment={vm.handleSubmitComment}
        />
      </div>
    </div>
  );
}

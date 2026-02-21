import { useNavigate } from "react-router-dom";
import { PasswordChangeModal } from "@/components/molecules/passwordChangeModal";
import { WithdrawModal } from "@/components/molecules/withdrawModal";
import { useProfile } from "./hooks";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useUser } from "@/contexts/UserContext";
import { ROUTES } from "@/shared/constants";
import {
  ProfileHeader,
  LoadingState,
  ProfileCard,
  PartyVotesSection,
  PointGuideSection,
  PointHistorySection,
  SecuritySection,
} from "./components";

export function Profile() {
  usePageMeta("내 프로필");
  const navigate = useNavigate();
  const { logout } = useUser();
  const {
    user,
    pointHistory,
    voteStats,
    isLoading,
    showPasswordModal,
    setShowPasswordModal,
    showWithdrawModal,
    setShowWithdrawModal,
    handleBack,
  } = useProfile();

  if (isLoading || !user) {
    return <LoadingState />;
  }

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ProfileHeader onBack={handleBack} />
        <ProfileCard user={user} />
        <PartyVotesSection voteStats={voteStats} />
        <PointGuideSection />
        <PointHistorySection pointHistory={pointHistory} />
        <SecuritySection
          onOpenPasswordModal={() => setShowPasswordModal(true)}
          onOpenWithdrawModal={() => setShowWithdrawModal(true)}
        />
      </div>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onComplete={async () => {
          await logout();
          navigate(ROUTES.HOME);
        }}
      />
    </div>
  );
}

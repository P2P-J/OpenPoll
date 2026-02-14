import { PasswordChangeModal } from "@/components/molecules/passwordChangeModal";
import { useProfile } from "./hooks";
import { usePageMeta } from "@/hooks/usePageMeta";
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
  const {
    user,
    pointHistory,
    voteStats,
    isLoading,
    showPasswordModal,
    setShowPasswordModal,
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
        <SecuritySection onOpenPasswordModal={() => setShowPasswordModal(true)} />
      </div>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

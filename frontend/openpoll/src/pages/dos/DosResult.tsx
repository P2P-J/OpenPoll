import { useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { DosResult as DosResultData } from "@/types/api.types";
import { dosResultTypes } from "@/shared/constants/dosResultTypes";
import { useResultData, createAxisResults } from "./hooks";
import {
  DosResultLoadingState,
  ErrorState,
  ResultHeader,
  AxesResultsSection,
  DescriptionSection,
  CharacteristicsSection,
  NoticeSection,
  ActionButtons,
  NavigationLinks,
} from "./components";
import { ShareModal } from "./components/ShareModal";

export function DosResult() {
  usePageMeta("DOS 테스트 결과", "나의 정치 성향 분석 결과를 확인하세요.");
  const { type } = useParams<{ type: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  const { resultTypeInfo, isLoading } = useResultData(type, navigate);

  const resultData = location.state?.result as DosResultData | undefined;

  const localResultData = useMemo(
    () => dosResultTypes.find((rt) => rt.id === type),
    [type]
  );

  const { detail, features, tags } = useMemo(
    () => ({
      detail: localResultData?.detail || [],
      features: localResultData?.features || [],
      tags: localResultData?.tag || [],
    }),
    [localResultData]
  );

  const axisResults = useMemo(
    () => createAxisResults(resultData),
    [resultData]
  );

  if (isLoading) return <DosResultLoadingState />;
  if (!resultTypeInfo) return <ErrorState />;

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <ResultHeader
          type={type || ""}
          name={resultTypeInfo.name}
          description={resultTypeInfo.description}
        />
        <AxesResultsSection axisResults={axisResults} hasData={!!resultData} />
        <DescriptionSection detail={detail} />
        <CharacteristicsSection features={features} tags={tags} />
        <NoticeSection />
        <ActionButtons onShare={() => setShowShareModal(true)} />
        <NavigationLinks />
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type={type || ""}
      />
    </div>
  );
}

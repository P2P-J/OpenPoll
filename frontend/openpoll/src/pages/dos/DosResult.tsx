import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { DosResult as DosResultData } from "@/types/api.types";
import { dosResultTypes } from "@/shared/constants/dosResultTypes";
import { useResultData } from "./hooks";
import {
  DosResultLoadingState,
  ErrorState,
  DescriptionSection,
  CharacteristicsSection,
  NoticeSection,
  ActionButtons,
  NavigationLinks,
} from "./components";
import { DosResultCard, type DosCardScores } from "./components/DosResultCard";
import { ShareModal } from "./components/ShareModal";
import { Toast } from "@/components/molecules/toast/Toast";
import { AdBanner } from "@/components/atoms/adBanner/AdBanner";

interface DetailsToggleProps {
  detail: string[];
  features: string[];
  tags: string[];
}

function DetailsToggle({ detail, features, tags }: DetailsToggleProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 32 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          color: "var(--color-foreground)",
          cursor: "pointer",
        }}
      >
        {open ? "접기" : "상세 설명 더 보기 ↓"}
      </button>
      {open && (
        <div style={{ marginTop: 16 }}>
          <DescriptionSection detail={detail} />
          <CharacteristicsSection features={features} tags={tags} />
          <NoticeSection />
        </div>
      )}
    </div>
  );
}

export function DosResult() {
  usePageMeta("DOS 테스트 결과", "나의 정치 성향 분석 결과를 확인하세요.");
  const { type } = useParams<{ type: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleImageSave = useCallback(() => {
    setShowToast(true);
  }, []);

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

  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const [cardScale, setCardScale] = useState(1);

  useEffect(() => {
    const el = cardWrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setCardScale(width / 1080);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cardScores: DosCardScores | undefined = useMemo(() => {
    if (!resultData?.axisPercentages) return undefined;
    const p = resultData.axisPercentages;
    return {
      change: p.change,
      distribution: p.distribution,
      rights: p.rights,
      development: p.development,
    };
  }, [resultData]);

  if (isLoading) return <DosResultLoadingState />;
  if (!resultTypeInfo) return <ErrorState />;

  return (
    <div className={`min-h-screen pt-16 bg-background text-foreground`}>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {localResultData && (
          <div
            ref={cardWrapperRef}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 640,
              margin: "0 auto",
              height: 1080 * cardScale,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 1080,
                height: 1080,
                transform: `scale(${cardScale})`,
                transformOrigin: "top left",
              }}
            >
              <DosResultCard
                type={localResultData}
                scores={cardScores}
                variant="square"
              />
            </div>
          </div>
        )}
        <DetailsToggle detail={detail} features={features} tags={tags} />
        <AdBanner className="mb-8" />
        <ActionButtons onShare={() => setShowShareModal(true)} onImageSave={handleImageSave} />
        <NavigationLinks />
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type={type || ""}
      />

      <Toast
        message="추후 구현될 기능입니다!"
        type="info"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        contentStyle={{ backgroundColor: "#ffffff", color: "#1a1a1a" }}
      />
    </div>
  );
}

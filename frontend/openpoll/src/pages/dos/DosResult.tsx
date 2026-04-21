import { useState, useCallback, useMemo, useRef } from "react";
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
import { useDosCardDownload } from "./hooks/useDosCardDownload";

const OG_W = 1200;
const OG_H = 630;

export function DosResult() {
  usePageMeta("DOS 테스트 결과", "나의 정치 성향 분석 결과를 확인하세요.");
  const { type } = useParams<{ type: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'error'>('idle');
  const captureRef = useRef<HTMLDivElement>(null);
  const download = useDosCardDownload();

  const { resultTypeInfo, isLoading } = useResultData(type, navigate);

  const resultData = location.state?.result as DosResultData | undefined;

  const localResultData = useMemo(
    () => dosResultTypes.find((rt) => rt.id === type),
    [type]
  );

  const handleImageSave = useCallback(async () => {
    if (!localResultData) return;
    try {
      await download(captureRef.current, localResultData.id);
      setSaveState('success');
    } catch {
      setSaveState('error');
    }
    setShowToast(true);
    setTimeout(() => setSaveState('idle'), 2500);
  }, [download, localResultData]);

  const { detail, features, tags } = useMemo(
    () => ({
      detail: localResultData?.detail || [],
      features: localResultData?.features || [],
      tags: localResultData?.tag || [],
    }),
    [localResultData]
  );

  const [cardScale, setCardScale] = useState(1);

  // 콜백 ref: isLoading 플립 후 실제로 DOM이 붙는 시점에 실행됨 (useRef+useEffect는 초기 렌더에 ref가 null이라 observer가 안 붙었음)
  const cardWrapperRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setCardScale(w / OG_W);
    };
    update();
    const observer = new ResizeObserver(update);
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
              height: OG_H * cardScale,
              overflow: "hidden",
              borderRadius: 24,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: OG_W,
                height: OG_H,
                transform: `scale(${cardScale})`,
                transformOrigin: "top left",
              }}
            >
              <DosResultCard
                type={localResultData}
                scores={cardScores}
                variant="og"
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <DescriptionSection detail={detail} />
          <CharacteristicsSection features={features} tags={tags} />
          <NoticeSection />
        </div>

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
        message={
          saveState === 'success'
            ? '결과 카드가 저장됐어요'
            : '저장에 실패했어요. 잠시 후 다시 시도해주세요.'
        }
        type={saveState === 'error' ? 'error' : 'success'}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        contentStyle={{ backgroundColor: "#ffffff", color: "#1a1a1a" }}
      />

      {/* 오프스크린 캡처 타깃: 1080x1080 원본 크기 (저장용) */}
      {localResultData && (
        <div
          style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}
          aria-hidden
        >
          <div ref={captureRef}>
            <DosResultCard type={localResultData} scores={cardScores} variant="square" />
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Brain, Home } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { dosResultTypes } from "@/shared/constants/dosResultTypes";
import {
    ResultHeader,
    DescriptionSection,
    CharacteristicsSection,
    NoticeSection,
} from "./components";

export function DosShare() {
    const { type } = useParams<{ type: string }>();

    const localResultData = useMemo(
        () => dosResultTypes.find((rt) => rt.id === type),
        [type]
    );

    usePageMeta(
        localResultData
            ? `DOS 유형: ${type} - ${localResultData.name}`
            : "DOS 결과 공유",
        localResultData?.description || "DOS 테스트 결과를 확인하세요."
    );

    const { detail, features, tags } = useMemo(
        () => ({
            detail: localResultData?.detail || [],
            features: localResultData?.features || [],
            tags: localResultData?.tag || [],
        }),
        [localResultData]
    );

    if (!localResultData) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-gray-400 mb-4">
                        존재하지 않는 결과 유형입니다.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
                    >
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-8 sm:pt-12">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
                {/* 공유 배지 */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mb-6"
                >
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-400">
                            공유된 DOS 테스트 결과
                        </span>
                    </div>
                </motion.div>

                <ResultHeader
                    type={type || ""}
                    name={localResultData.name}
                    description={localResultData.description}
                />

                {/* 정치 좌표 그래프 숨김 - 공유 페이지에서는 미표시 */}

                <DescriptionSection detail={detail} />
                <CharacteristicsSection features={features} tags={tags} />
                <NoticeSection />

                {/* 공유 전용 버튼 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                >
                    <Link
                        to="/dos"
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 sm:py-4 bg-white text-black rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors"
                    >
                        <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>나도 테스트 하러가기</span>
                    </Link>
                    <Link
                        to="/"
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors"
                    >
                        <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>홈으로 돌아가기</span>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}

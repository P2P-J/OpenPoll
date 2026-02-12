import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Brain, Scale, Newspaper, CheckCircle2 } from "lucide-react";
import { dashboardApi, dosApi, getBalanceList } from "@/api";

const features = [
  {
    icon: Brain,
    title: "정치 MBTI",
    desc: "8values 기반 성향 분석",
  },
  {
    icon: Scale,
    title: "밸런스 게임",
    desc: "이슈별 찬반 투표",
  },
  {
    icon: Newspaper,
    title: "AI 중립 뉴스",
    desc: "순화된 정치 뉴스",
  },
];

export function AuthSidePanel() {
  const [stats, setStats] = useState({
    dosTotal: 0,
    voteTotal: 0,
    balanceTotal: 0,
  });

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const [dosStats, dashStats, balanceList] = await Promise.all([
          dosApi.getStatistics(),
          dashboardApi.getStats(),
          getBalanceList(),
        ]);

        const balanceTotal = balanceList.reduce(
          (sum, item) => sum + (item.totalVotes ?? 0),
          0,
        );

        if (!mounted) return;
        setStats({
          dosTotal: dosStats.total ?? 0,
          voteTotal: dashStats.totalVotes ?? 0,
          balanceTotal,
        });
      } catch {
      }
    };

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="relative flex h-full w-full flex-col justify-center overflow-hidden border-r border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 lg:p-12">
      <div className="relative z-10 mx-auto w-full" style={{ maxWidth: 660 }}>
        <Link
          to="/"
          className="inline-flex items-center"
          style={{ marginTop: -64, marginBottom: 40, columnGap: 20 }}
        >
          <div
            className="flex items-center justify-center shadow-smooth"
            style={{
              background: "#ffffff",
              width: 48,
              height: 48,
              minWidth: 48,
              minHeight: 48,
              borderRadius: 14,
            }}
          >
            <span className="font-bold text-2xl" style={{ color: "#0b0b0b" }} aria-hidden="true">
              O
            </span>
          </div>
          <span className="font-bold tracking-tight" style={{ fontSize: 25 }}>
            OpenPoll
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-6 font-bold" style={{ fontSize: 45, lineHeight: 1.14 }}>
            정치, 이제는
            <br />
            <span className="text-gray-400">쉽고 중립적으로</span>
          </h2>

          <p
            className="text-gray-300"
            style={{ fontSize: 16, lineHeight: 1.62, marginBottom: 35 }}
          >
            오픈폴은 20-40대를 위한 중립적 정치 참여 플랫폼입니다.
            복잡한 정치를 게임처럼 쉽게 이해하고 참여하세요.
          </p>

          <div className="mb-12">
            <h3 className="mb-4 flex items-center font-bold" style={{ fontSize: 22 }}>
              <CheckCircle2 className="mr-2 h-6 w-6 text-green-400" />
              주요 기능
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              {features.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5"
                  style={{ width: "92%", minHeight: 74 }}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 text-white" />
                  <div className="flex flex-col justify-center">
                    <p className="mb-1 font-semibold" style={{ fontSize: 14, lineHeight: 1.3 }}>
                      {item.title}
                    </p>
                    <p className="text-gray-400" style={{ fontSize: 11.5, lineHeight: 1.4 }}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="border-t border-white/10"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 24,
              marginTop: 58,
              paddingTop: 56,
            }}
          >
            <div className="text-center">
              <div className="mb-1 font-bold" style={{ fontSize: 30 }}>
                {stats.dosTotal.toLocaleString()}
              </div>
              <div className="text-gray-400" style={{ fontSize: 13 }}>
                DOS검사 횟수
              </div>
            </div>
            <div className="text-center">
              <div className="mb-1 font-bold" style={{ fontSize: 30 }}>
                {stats.voteTotal.toLocaleString()}
              </div>
              <div className="text-gray-400" style={{ fontSize: 13 }}>
                투표 총 참여 횟수
              </div>
            </div>
            <div className="text-center">
              <div className="mb-1 font-bold" style={{ fontSize: 30 }}>
                {stats.balanceTotal.toLocaleString()}
              </div>
              <div className="text-gray-400" style={{ fontSize: 13 }}>
                밸런스 게임 참여 횟수
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </aside>
  );
}

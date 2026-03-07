import { memo } from "react";
import { motion } from "motion/react";
import { CalendarCheck, Gift, Coins } from "lucide-react";

export const RewardInfo = memo(function RewardInfo() {
  const rewards = [
    {
      icon: CalendarCheck,
      title: "일일 출석",
      value: "+30P",
      description: "매일 출석 시 지급",
      color: "from-emerald-400 to-green-500",
    },
    {
      icon: Gift,
      title: "7일 연속 보너스",
      value: "+20P",
      description: "매 7일마다 추가 지급",
      color: "from-yellow-400 to-amber-500",
    },
    {
      icon: Coins,
      title: "주간 최대",
      value: "230P",
      description: "7일 x 30P + 20P 보너스",
      color: "from-purple-400 to-violet-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
    >
      {rewards.map((reward, index) => (
        <motion.div
          key={reward.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="glass-effect rounded-2xl p-4 sm:p-5"
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${reward.color} flex items-center justify-center mb-3`}
          >
            <reward.icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-foreground-muted mb-1">{reward.title}</p>
          <p className="text-2xl font-bold text-foreground">{reward.value}</p>
          <p className="text-xs text-foreground-subtle mt-1">{reward.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
});

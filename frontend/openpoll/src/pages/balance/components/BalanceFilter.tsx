import { motion } from "motion/react";
import { Flame, Clock, CheckCircle } from "lucide-react";
import type { FilterType } from "../hooks/useBalanceList";

interface BalanceFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS = [
  { key: "hot" as const, label: "HOT", icon: Flame },
  { key: "recent" as const, label: "최신", icon: Clock },
  { key: "completed" as const, label: "참여완료", icon: CheckCircle },
];

export function BalanceFilter({ filter, onFilterChange }: BalanceFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex justify-center space-x-2 sm:space-x-3 mb-8 sm:mb-12"
    >
      {FILTERS.map((item) => (
        <button
          key={item.key}
          onClick={() => onFilterChange(item.key)}
          className={`flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all ${
            filter === item.key
              ? "bg-white text-black"
              : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
          }`}
        >
          <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </motion.div>
  );
}

import { motion } from "motion/react";
import { User, Mail, MapPin, Users, Calendar, Coins, Award } from "lucide-react";
import type { User as UserInfo } from "@/types/api.types";
import { getGenderText } from "@/shared/utils/profileHelpers";
import { useTheme } from "@/contexts/ThemeContext";

interface ProfileCardProps {
  user: UserInfo;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`rounded-3xl border shadow-sm p-6 sm:p-8 mb-6 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 shrink-0 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: isDark ? '#e5e7eb' : '#1f2937' }}
        >
          <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" style={{ color: isDark ? '#1f2937' : '#ffffff' }} />
        </div>
        <div className="min-w-0">
          <h2 className={`text-xl sm:text-2xl font-bold mb-1 truncate ${isDark ? 'text-white' : 'text-black'}`}>
            {user.nickname}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className={`font-semibold text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {user.points.toLocaleString()} 포인트
              </span>
            </div>
            <div className={`flex items-center space-x-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Award className="w-4 h-4" />
              <span>
                총 {(user.totalEarnedPoints || 0).toLocaleString()}P 획득
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoItem icon={Mail} label="이메일" value={user.email} isDark={isDark} />
        <InfoItem icon={Calendar} label="나이" value={`${user.age}세`} isDark={isDark} />
        <InfoItem icon={Users} label="성별" value={getGenderText(user.gender)} isDark={isDark} />
        <InfoItem icon={MapPin} label="지역" value={user.region} isDark={isDark} />
      </div>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value, isDark }: { icon: typeof Mail; label: string; value: string; isDark: boolean }) {
  return (
    <div className={`flex items-center space-x-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
      <div>
        <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{value}</p>
      </div>
    </div>
  );
}

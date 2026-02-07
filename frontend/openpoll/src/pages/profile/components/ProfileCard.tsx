import { motion } from "motion/react";
import { User, Mail, MapPin, Users, Calendar, Coins, Award } from "lucide-react";
import type { User as UserInfo } from "@/types/api.types";
import { getGenderText } from "@/shared/utils/profileHelpers";

interface ProfileCardProps {
  user: UserInfo;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8 mb-6"
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-32 h-32 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-full flex items-center justify-center shadow-lg">
          <User className="w-16 h-16 text-white dark:text-black" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1 dark:text-white">
            {user.nickname}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {user.points.toLocaleString()} 포인트
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Award className="w-4 h-4" />
              <span>
                총 {(user.totalEarnedPoints || 0).toLocaleString()}P 획득
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              이메일
            </p>
            <p className="font-semibold dark:text-white">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              나이
            </p>
            <p className="font-semibold dark:text-white">{user.age}세</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              성별
            </p>
            <p className="font-semibold dark:text-white">
              {getGenderText(user.gender)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              지역
            </p>
            <p className="font-semibold dark:text-white">{user.region}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

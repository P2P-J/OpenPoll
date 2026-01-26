import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Scale, Newspaper, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  const partyData = [
    { 
      name: '더불어민주당', 
      value: 38.5, 
      color: '#004EA2',
      logo: '🔵' // Placeholder - replace with actual logo
    },
    { 
      name: '국민의힘', 
      value: 32.8, 
      color: '#E61E2B',
      logo: '🔴'
    },
    { 
      name: '정의당', 
      value: 8.2, 
      color: '#FFCC00',
      logo: '🟡'
    },
    { 
      name: '기본소득당', 
      value: 4.1, 
      color: '#00A0E9',
      logo: '🔷'
    },
    { 
      name: '기타/무당층', 
      value: 16.4, 
      color: '#9CA3AF',
      logo: '⚪'
    },
  ];

  const features = [
    {
      icon: Brain,
      title: '정치 MBTI',
      description: '8values 기반 테스트로 나의 정치 성향을 발견하세요',
      link: '/mbti',
      color: 'from-gray-900 to-gray-700',
    },
    {
      icon: Scale,
      title: '밸런스 게임',
      description: '정치 이슈에 대한 찬반 투표로 의견을 나눠보세요',
      link: '/balance',
      color: 'from-gray-700 to-gray-500',
    },
    {
      icon: Newspaper,
      title: '중립 뉴스',
      description: 'AI가 순화한 중립적인 정치 뉴스를 읽어보세요',
      link: '/news',
      color: 'from-gray-600 to-gray-400',
    },
  ];

  const handleVote = (partyName: string) => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다');
      return;
    }
    setSelectedParty(partyName);
  };

  return (
    <div className="pt-16">
      {/* Hero Section with Support Rate */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px),
                             repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
              정치,
              <br />
              <span className="text-gray-400">이제는 쉽게</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              복잡한 정치 뉴스 대신, 중립적이고 순화된 정보를.
              <br className="hidden sm:block" />
              게임처럼 즐기며 정치 참여의 첫 걸음을 내딛어보세요.
            </p>
          </motion.div>

          {/* Support Rate Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-12">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">실시간 지지율</h2>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
                  총 <span className="text-white font-semibold">12,458명</span>이 참여했습니다
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {partyData.map((party, index) => (
                  <motion.div
                    key={party.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="text-2xl sm:text-3xl lg:text-4xl">{party.logo}</div>
                        <div>
                          <div className="font-bold text-sm sm:text-base lg:text-lg">{party.name}</div>
                          <div className="text-xs sm:text-sm text-gray-400">
                            약 {Math.round((party.value / 100) * 12458).toLocaleString()}명
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                        <span className="text-2xl sm:text-3xl font-bold" style={{ color: party.color }}>
                          {party.value}%
                        </span>
                        {isLoggedIn && (
                          <button
                            onClick={() => handleVote(party.name)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                              selectedParty === party.name
                                ? 'bg-white text-black'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                            }`}
                          >
                            {selectedParty === party.name ? (
                              <span className="flex items-center space-x-1">
                                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>선택됨</span>
                              </span>
                            ) : (
                              '투표하기'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{ backgroundColor: party.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${party.value}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {!isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="mt-6 sm:mt-8 text-center"
                >
                  <button
                    onClick={() => setIsLoggedIn(true)}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors"
                  >
                    로그인하고 투표하기
                  </button>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                    로그인하면 지지하는 정당에 투표할 수 있어요
                  </p>
                </motion.div>
              )}

              {selectedParty && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
                >
                  <p className="text-green-400 font-semibold text-sm sm:text-base">
                    ✅ {selectedParty}에 투표하셨습니다
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    변경 시 200P가 차감됩니다
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 text-center text-xs sm:text-sm text-gray-400"
              >
                <p>시즌제로 운영됩니다 · 현재 Season 1 · 익명 집계</p>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <Link
              to="/mbti"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <span>정치 MBTI 시작하기</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/balance"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-base sm:text-lg hover:bg-white hover:text-black transition-colors"
            >
              밸런스 게임 참여하기
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">주요 기능</h2>
          <p className="text-lg sm:text-xl text-gray-600">
            오픈폴과 함께 정치에 참여하는 새로운 방법
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link
                to={feature.link}
                className="group block h-full"
              >
                <div className={`relative h-full p-6 sm:p-8 rounded-2xl bg-gradient-to-br ${feature.color} text-white overflow-hidden transition-transform hover:scale-[1.02]`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative">
                    <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-white/80 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
                      <span>시작하기</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { label: '전체 사용자', value: '12,458' },
              { label: 'MBTI 완료', value: '8,234' },
              { label: '투표 참여', value: '15,670' },
              { label: '뉴스 조회', value: '23,891' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="bg-black text-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
            3분이면 나의 정치 성향을 알 수 있어요
          </p>
          <Link
            to="/mbti"
            className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors"
          >
            <span>정치 MBTI 테스트 시작</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
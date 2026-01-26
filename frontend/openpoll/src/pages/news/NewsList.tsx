import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ExternalLink, Sparkles } from 'lucide-react';

const categories = ['전체', '경제', '외교', '국회', '선거', '사회'];

const newsData = [
  {
    id: 1,
    category: '국회',
    title: '국회, 예산안 처리 두고 여야 이견',
    summary: [
      '여당은 경제 활성화를 위한 예산 증액을 주장',
      '야당은 재정 건전성 우려로 신중한 접근 요구',
      '합의점 도출을 위한 협상 지속 중',
    ],
    tags: ['예산안', '여야갈등', '국회'],
    source: '한국일보',
    publishedAt: '2시간 전',
    isNeutralized: true,
  },
  {
    id: 2,
    category: '외교',
    title: '한미 정상회담 결과 발표',
    summary: [
      '경제 협력 강화 및 반도체 동맹 구축 합의',
      '양국 간 교역 증대를 위한 협력 방안 논의',
      '다음 회담은 6개월 후 워싱턴에서 개최 예정',
    ],
    tags: ['한미관계', '정상회담', '외교'],
    source: 'SBS',
    publishedAt: '4시간 전',
    isNeutralized: true,
  },
  {
    id: 3,
    category: '경제',
    title: '기준금리 동결 결정, 경제 전망은',
    summary: [
      '한국은행, 물가 안정과 경제 성장 균형 고려',
      '전문가들은 향후 3개월간 추가 동결 전망',
      '부동산 시장과 가계 부채에 미치는 영향 주목',
    ],
    tags: ['금리', '한국은행', '경제정책'],
    source: '중앙일보',
    publishedAt: '6시간 전',
    isNeutralized: true,
  },
  {
    id: 4,
    category: '사회',
    title: '청년 일자리 정책 개선안 발표',
    summary: [
      '정부, 청년 고용 지원 예산 20% 증액 계획',
      '중소기업 취업자 대상 인센티브 확대',
      '전문가들은 실효성에 대한 면밀한 검토 필요성 제기',
    ],
    tags: ['청년정책', '일자리', '고용'],
    source: '한겨레',
    publishedAt: '8시간 전',
    isNeutralized: true,
  },
];

export function NewsList() {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredNews = selectedCategory === '전체'
    ? newsData
    : newsData.filter((news) => news.category === selectedCategory);

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">중립 뉴스</h1>
          <p className="text-gray-600 text-base sm:text-lg">
            AI가 순화한 중립적이고 객관적인 정치 뉴스
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex overflow-x-auto space-x-2 mb-6 sm:mb-8 pb-2"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* News List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredNews.map((news, index) => (
            <motion.article
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border-2 border-black hover:border-gray-800 transition-all hover:shadow-2xl shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="px-2.5 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-full">
                      {news.category}
                    </span>
                    {news.isNeutralized && (
                      <div className="flex items-center space-x-1 text-blue-600 text-xs sm:text-sm font-semibold">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>AI 중립화</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 leading-tight">
                    {news.title}
                  </h2>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">
                  📝 3줄 요약
                </h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {news.summary.map((line, i) => (
                    <li key={i} className="flex items-start text-gray-700 text-sm sm:text-base">
                      <span className="mr-2 text-gray-400">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {news.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 sm:px-3 py-1 bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
                <div className="text-xs sm:text-sm text-gray-500">
                  {news.source} · {news.publishedAt}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Link
                    to={`/news/${news.id}`}
                    className="px-4 py-2 bg-black text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-800 transition-colors text-center"
                  >
                    전문 보기
                  </Link>
                  <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-200 transition-colors">
                    <span>원문 보기</span>
                    <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
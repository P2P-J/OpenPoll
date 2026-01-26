import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ExternalLink, Sparkles, Clock, Tag } from 'lucide-react';

export function NewsDetail() {
  const news = {
    category: '국회',
    title: '국회, 예산안 처리 두고 여야 이견',
    publishedAt: '2024년 1월 23일 오후 2시',
    source: '한국일보',
    originalUrl: 'https://example.com/original-article',
    tags: ['예산안', '여야갈등', '국회'],
    content: `
      <p class="mb-4">국회에서 2024년도 예산안 처리를 두고 여당과 야당 간 의견 차이가 지속되고 있습니다.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">여당의 입장</h2>
      <p class="mb-4">여당은 경제 활성화를 위해 R&D 예산과 중소기업 지원 예산을 증액해야 한다는 입장입니다. 특히 반도체 산업 육성과 청년 고용 지원 분야에 대한 투자 확대가 필요하다고 주장하고 있습니다.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">야당의 입장</h2>
      <p class="mb-4">반면 야당은 재정 건전성을 우려하며 신중한 접근이 필요하다는 입장입니다. 무분별한 예산 증액보다는 기존 예산의 효율적 집행이 우선이라고 주장하고 있습니다.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">향후 전망</h2>
      <p class="mb-4">양측은 합의점 도출을 위한 협상을 지속하고 있으며, 전문가들은 일부 항목에서 절충안이 마련될 것으로 전망하고 있습니다. 예산안 처리 시한인 다음 달 2일까지 합의가 이루어질지 주목됩니다.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">전문가 의견</h2>
      <p class="mb-4">경제 전문가들은 경제 상황과 재정 건전성을 모두 고려한 균형잡힌 접근이 필요하다고 조언하고 있습니다. 단기적 경기 부양과 장기적 재정 안정성 사이에서 적절한 균형점을 찾는 것이 중요하다는 지적입니다.</p>
    `,
  };

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/news"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">목록으로</span>
        </Link>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
              {news.category}
            </span>
            <div className="flex items-center space-x-2 text-blue-600 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>AI 중립화 처리됨</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            {news.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{news.publishedAt}</span>
            </div>
            <div>•</div>
            <div>{news.source}</div>
          </div>
        </motion.div>

        {/* AI Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900 leading-relaxed">
              <p className="font-semibold mb-2">AI 중립화 안내</p>
              <p className="text-blue-800">
                이 기사는 AI에 의해 중립화 처리되었습니다. 자극적인 표현은 순화되었으며,
                가능한 한 객관적인 사실 중심으로 재구성되었습니다. 원문과 비교하여 읽어보실 수 있습니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-start space-x-3 mb-8"
        >
          <Tag className="w-5 h-5 text-gray-400 mt-1" />
          <div className="flex flex-wrap gap-2">
            {news.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Original Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">원문 기사 보기</p>
              <p className="text-sm text-gray-600">
                {news.source}에서 작성한 원본 기사를 확인하세요
              </p>
            </div>
            <a
              href={news.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <span>원문 보기</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

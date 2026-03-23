import prisma from '../../config/database.js';
import AppError from '../../utils/AppError.js';
import { containsProfanity } from '../../utils/profanityFilter.js';

// SSE 클라이언트 관리
const clients = new Set();

export const addClient = (res) => {
  clients.add(res);
};

export const removeClient = (res) => {
  clients.delete(res);
};

// 연속 동일 메시지 방지를 위한 메모리 캐시
// key: userId, value: { content, timestamp }
const recentMessages = new Map();

// 오래된 캐시 엔트리 정리 (5분마다)
const cacheCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of recentMessages.entries()) {
    if (now - data.timestamp > 10000) {
      recentMessages.delete(userId);
    }
  }
}, 5 * 60 * 1000);

// graceful shutdown 시 정리
export const cleanup = () => {
  clearInterval(cacheCleanupInterval);
  clients.clear();
  recentMessages.clear();
};

/**
 * 새 메시지를 모든 SSE 클라이언트에게 브로드캐스트
 */
const broadcastMessage = (message) => {
  if (clients.size === 0) return;

  const data = `data: ${JSON.stringify({ type: 'new_message', message })}\n\n`;

  clients.forEach((client) => {
    try {
      client.write(data);
    } catch (err) {
      clients.delete(client);
    }
  });
};

/**
 * 최근 메시지 조회 (커서 기반 페이지네이션)
 * @param {number|null} cursor - 마지막으로 받은 메시지의 id (이보다 작은 id를 조회)
 * @param {number} limit - 조회 개수 (기본 50)
 */
export const getMessages = async (cursor, limit = 50) => {
  const where = cursor ? { id: { lt: cursor } } : {};

  // limit + 1개 조회하여 hasMore를 정확히 판정
  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { id: 'desc' },
    take: limit + 1,
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
    },
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop(); // 초과 1개 제거

  const nextCursor = hasMore ? messages[messages.length - 1].id : null;

  // 프론트엔드 타입에 맞게 평탄화
  const formatted = messages.reverse().map((m) => ({
    id: m.id,
    nickname: m.user?.nickname || '익명',
    role: m.user?.role || 'USER',
    content: m.content,
    createdAt: m.createdAt,
  }));

  return {
    messages: formatted,
    nextCursor,
    hasMore,
  };
};

/**
 * 메시지 전송
 * @param {string} userId - 사용자 ID
 * @param {string} content - 메시지 내용
 */
export const sendMessage = async (userId, content) => {
  // 욕설 필터 체크
  if (containsProfanity(content)) {
    throw AppError.badRequest('부적절한 표현이 포함되어 있습니다.');
  }

  // 연속 동일 메시지 3초 이내 재전송 방지
  const recent = recentMessages.get(userId);
  if (recent && recent.content === content && Date.now() - recent.timestamp < 3000) {
    throw AppError.badRequest('동일한 메시지를 연속으로 보낼 수 없습니다. 잠시 후 다시 시도해주세요.');
  }

  // DB 저장
  const message = await prisma.chatMessage.create({
    data: {
      userId,
      content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
    },
  });

  // 최근 메시지 캐시 업데이트
  recentMessages.set(userId, { content, timestamp: Date.now() });

  // 프론트엔드 타입에 맞게 평탄화
  const formatted = {
    id: message.id,
    nickname: message.user?.nickname || '익명',
    role: message.user?.role || 'USER',
    content: message.content,
    createdAt: message.createdAt,
  };

  // SSE 브로드캐스트
  broadcastMessage(formatted);

  return formatted;
};

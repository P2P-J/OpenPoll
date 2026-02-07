export const CATEGORIES = ["전체", "경제", "외교", "국회", "선거", "사회"] as const;
export const ITEMS_PER_PAGE = 5;
export const POLLING_INTERVAL_MS = 40 * 1000;

export const CATEGORY_TAG_MAP: Record<string, string> = {
  경제: "경제",
  금리: "경제",
  수출: "경제",
  물가: "경제",
  외교: "외교",
  정상회담: "외교",
  국제협력: "외교",
  국회: "국회",
  법안: "국회",
  예산안: "국회",
  선거: "선거",
  투표: "선거",
  여론조사: "선거",
  사회: "사회",
  복지: "사회",
  교육: "사회",
  민생: "국회",
  개혁: "국회",
};

const DEFAULT_CATEGORY = "사회";

export function getCategoryFromTags(tags: string[]): string {
  for (const tag of tags) {
    if (CATEGORY_TAG_MAP[tag]) {
      return CATEGORY_TAG_MAP[tag];
    }
  }
  return DEFAULT_CATEGORY;
}

export function getTimeAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMinutes = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }
  if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}시간 전`;
  }
  return `${Math.floor(diffInMinutes / 1440)}일 전`;
}

export function formatPublishedDate(createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "오후" : "오전";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${year}년 ${month}월 ${day}일 ${period} ${displayHours}시 ${minutes}분`;
}

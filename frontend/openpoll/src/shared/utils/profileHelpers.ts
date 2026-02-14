export function getGenderText(gender: string): string {
  switch (gender) {
    case "MALE":
      return "남성";
    case "FEMALE":
      return "여성";
    default:
      return gender;
  }
}

const POINT_TYPE_MAP: Record<string, string> = {
  SIGNUP: "회원가입 완료",
  DOS: "정치 MBTI 완료",
  BALANCE_GAME: "밸런스 게임 참여",
  NEWS_READ: "뉴스 읽기",
  DAILY_ATTENDANCE: "일일 출석",
  CONSECUTIVE_ATTENDANCE_BONUS: "연속 출석 보너스 (7일 연속)",
  PARTY_VOTE: "정당 지지 투표",
};

const POINT_INFO: Record<string, string> = {
  SIGNUP: "+500P",
  DOS: "+300P",
  BALANCE_GAME: "+50P",
  NEWS_READ: "+10P",
  DAILY_ATTENDANCE: "+30P",
  CONSECUTIVE_ATTENDANCE_BONUS: "+20P",
  PARTY_VOTE: "-5P",
};

export function getPointTypeText(type: string, amount: number): string {
  const baseName = POINT_TYPE_MAP[type] || type;
  const expectedPoints = POINT_INFO[type];

  if (
    expectedPoints &&
    Math.abs(amount).toString() !== expectedPoints.replace(/[+\-P]/g, "")
  ) {
    return `${baseName} (${expectedPoints})`;
  }

  return baseName;
}

export function formatProfileDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

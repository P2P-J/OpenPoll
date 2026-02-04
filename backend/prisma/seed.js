import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const parties = [
    { name: "더불어민주당", color: "#004EA2", order: 1 },
    { name: "국민의힘", color: "#E61E2B", order: 2 },
    { name: "정의당", color: "#FFCC00", order: 3 },
    { name: "기본소득당", color: "#00D2C3", order: 4 },
    { name: "기타/무당층", color: "#808080", order: 5 },
  ];

  for (const party of parties) {
    await prisma.party.upsert({
      where: { name: party.name },
      update: { color: party.color, order: party.order },
      create: party,
    });
  }
  console.log("Parties seeded");

  // DOS 질문 시드
  // direction: 1 => 정방향(1-3이 첫번째 문자/높은%방향), -1 => 역방향(1-3이 두번째 문자/낮은%방향)
  // 분배축: M(Merit) vs E(Equality) - 높은% = M
  // 권리축: F(Freedom) vs O(Order) - 높은% = F
  // 변화축: C(Change) vs S(Stability) - 높은% = C
  // 발전축: D(Development) vs N(Nature) - 높은% = D

  const dosQuestions = [
    // === 분배축 (distribution): M(경쟁) vs E(평등) ===
    {
      question:
        "개인의 노력과 성취에 따른 보상 차이는 사회에서 자연스러운 현상이라고 생각한다.",
      axis: "distribution",
      direction: 1,
      order: 1,
    },
    {
      question: "사회 구성원 간의 격차를 줄이는 것이 사회 안정에 중요하다.",
      axis: "distribution",
      direction: -1,
      order: 2,
    },
    {
      question:
        "경제적 성과는 개인의 선택과 노력에 따라 달라지는 것이 당연하다.",
      axis: "distribution",
      direction: 1,
      order: 3,
    },
    {
      question:
        "기회와 자원은 사회 전체가 비교적으로 고르게 누릴 수 있어야 한다고 생각한다.",
      axis: "distribution",
      direction: -1,
      order: 4,
    },
    {
      question:
        "팀 프로젝트에서 결과가 뛰어난 사람이 더 많은 보상을 받는 것이 자연스럽다고 생각한다.",
      axis: "distribution",
      direction: 1,
      order: 5,
    },
    {
      question:
        "운이 좋았던 사람과 그렇지 않았던 사람 사이의 결과 차이를 사회가 어느 정도 보완해주어야 한다.",
      axis: "distribution",
      direction: -1,
      order: 6,
    },
    {
      question:
        "나는 수익이 높은 사람에게 높은 세금을 부과해 소득을 재분배하려는 정책에 대해 긍정적으로 생각한다.",
      axis: "distribution",
      direction: -1,
      order: 7,
    },
    {
      question:
        "입시 환경에서 지역에 따라 유리해지는 제도는 공정한 경쟁이 아니라고 생각한다.",
      axis: "distribution",
      direction: 1,
      order: 8,
    },

    // === 권리축 (rights): F(자유) vs O(규율) ===
    {
      question: "개인의 선택과 자유는 사회 규범보다 우선 시 되어야 한다.",
      axis: "rights",
      direction: 1,
      order: 9,
    },
    {
      question:
        "사회의 질서와 안전을 위해서는 일정 수준의 규율과 규제가 필요하다.",
      axis: "rights",
      direction: -1,
      order: 10,
    },
    {
      question: "공동의 안전을 위해 개인의 선택이 제한될 수 있다고 생각한다.",
      axis: "rights",
      direction: -1,
      order: 11,
    },
    {
      question:
        "사람마다 다르게 행동하는 것보다는 일정한 기준이 있는 편이 사회에 도움이 된다.",
      axis: "rights",
      direction: -1,
      order: 12,
    },
    {
      question:
        "정해진 규범보다는 개인의 사정이 더 중요하게 고려돼야 한다고 생각한다.",
      axis: "rights",
      direction: 1,
      order: 13,
    },
    {
      question:
        "공공장소에서 개인의 행동이 타인에게 불편함을 준다면 제한하는 것이 필요하다고 생각한다.",
      axis: "rights",
      direction: -1,
      order: 14,
    },
    {
      question:
        "안전벨트 필수 착용, 헬멧의 의무화 같은 교통 법규는 개인의 자유를 침해한다고 생각한다.",
      axis: "rights",
      direction: 1,
      order: 15,
    },
    {
      question: "나는 학생의 두발 및 복장의 자유는 당연한 권리라고 생각한다.",
      axis: "rights",
      direction: 1,
      order: 16,
    },

    // === 변화축 (change): C(변화) vs S(안정) ===
    {
      question: "오랫동안 유지되어 온 방식에는 그만한 이유가 있다고 생각한다.",
      axis: "change",
      direction: -1,
      order: 17,
    },
    {
      question: "새로운 시도와 변화는 사회를 더 나은 방향으로 이끈다고 느낀다.",
      axis: "change",
      direction: 1,
      order: 18,
    },
    {
      question: "급격한 변화보다는 점진적인 개선이 더 바람직하다고 생각한다.",
      axis: "change",
      direction: -1,
      order: 19,
    },
    {
      question:
        "기존의 방식을 과감히 바꾸는 것이 필요하다고 느끼는 경우가 많다.",
      axis: "change",
      direction: 1,
      order: 20,
    },
    {
      question:
        "오래된 동네의 불편함이 있더라도, 그 분위기가 유지되는 것은 가치가 있다고 생각한다.",
      axis: "change",
      direction: -1,
      order: 21,
    },
    {
      question:
        "새로운 기술이나 제도가 도입될 때, 완전히 자리 잡기 전까지는 기존 방식과 병행하는 편이 낫다.",
      axis: "change",
      direction: -1,
      order: 22,
    },
    {
      question:
        "익숙한 서비스가 전면 개편되었을 때, 적응하는 과정 자체가 사회 발전의 일부라고 생각한다.",
      axis: "change",
      direction: 1,
      order: 23,
    },
    {
      question:
        "당장 혼란이 있더라도 장기적으로 더 나아질 수 있다면 변화를 선택할 가치가 있다고 느낀다.",
      axis: "change",
      direction: 1,
      order: 24,
    },

    // === 발전축 (development): D(개발) vs N(환경) ===
    {
      question:
        "장기적인 자연 보존을 위해 개발 속도를 조절하는 것은 필요하다고 생각한다.",
      axis: "development",
      direction: -1,
      order: 25,
    },
    {
      question:
        "기술 발전과 경제 성장을 위해 일정 수준의 환경 변화는 감수할 수 있다.",
      axis: "development",
      direction: 1,
      order: 26,
    },
    {
      question:
        "환경이 훼손된 이후 복구하는 것보다, 처음부터 보존하는 편이 더 중요하다.",
      axis: "development",
      direction: -1,
      order: 27,
    },
    {
      question: "국가 경쟁력을 높이기 위해서는 기술 개발을 우선 시 해야 한다.",
      axis: "development",
      direction: 1,
      order: 28,
    },
    {
      question:
        "산림에 스키장을 조성하는 계획이 있다면, 자연 훼손이 일부 발생하더라도 지역 경제와 관광지 활성화를 위해 추진할 수 있다고 생각한다.",
      axis: "development",
      direction: 1,
      order: 29,
    },
    {
      question:
        "신기술을 도입해 사회가 발전할 수 있다면, 기존 자연 환경을 일부 바꾸는 것은 고려할 수 있다.",
      axis: "development",
      direction: 1,
      order: 30,
    },
    {
      question:
        "훼손된 자연을 복구하는 데 드는 비용을 고려하면, 처음부터 개발을 제한하는 편이 낫다고 생각한다.",
      axis: "development",
      direction: -1,
      order: 31,
    },
    {
      question:
        "아마존 열대 우림을 개발하는 것은 기술의 발전보다는 악영향이 훨씬 많을 것이라고 예상된다.",
      axis: "development",
      direction: -1,
      order: 32,
    },
  ];

  await prisma.dosQuestion.deleteMany();

  for (const q of dosQuestions) {
    await prisma.dosQuestion.create({
      data: q,
    });
  }
  console.log(`DOS questions seeded: ${dosQuestions.length} questions`);

  // DOS 결과 유형 시드 (축 순서: 변화 → 분배 → 권리 → 발전)
  // C/S: 변화/안정, M/E: 경쟁/평등, F/O: 자유/규율, D/N: 개발/환경
  const dosResultTypes = [
    {
      id: "CMFD",
      name: "진보적 자유주의자",
      description:
        "변화를 추구하며 개인의 자유와 경쟁을 중시하고, 발전을 위한 개발에 긍정적인 유형입니다.",
      traits: JSON.stringify([
        "혁신 지향",
        "개인주의",
        "성장 중심",
        "자유 옹호",
      ]),
    },
    {
      id: "CMFN",
      name: "녹색 진보주의자",
      description:
        "변화와 자유를 중시하되, 환경 보존에 높은 가치를 두는 유형입니다.",
      traits: JSON.stringify([
        "혁신 지향",
        "개인주의",
        "환경 친화",
        "자유 옹호",
      ]),
    },
    {
      id: "CMOD",
      name: "진보적 권위주의자",
      description:
        "변화와 경쟁을 지지하면서 사회 질서를 중시하고, 개발에 적극적인 유형입니다.",
      traits: JSON.stringify([
        "혁신 지향",
        "질서 중시",
        "성장 중심",
        "규율 선호",
      ]),
    },
    {
      id: "CMON",
      name: "진보적 보존주의자",
      description:
        "변화를 추구하지만 규율을 중시하며, 환경 보존에 관심이 높은 유형입니다.",
      traits: JSON.stringify([
        "혁신 지향",
        "질서 중시",
        "환경 친화",
        "규율 선호",
      ]),
    },
    {
      id: "CEFD",
      name: "진보적 평등주의자",
      description:
        "변화와 평등, 자유를 중시하며 발전을 위한 개발에 긍정적인 유형입니다.",
      traits: JSON.stringify([
        "혁신 지향",
        "평등 지향",
        "성장 중심",
        "자유 옹호",
      ]),
    },
    {
      id: "CEFN",
      name: "녹색 평등주의자",
      description:
        "변화와 평등, 자유를 추구하면서 환경 보존을 중요시하는 유형입니다.",
      traits: JSON.stringify([
        "혁신 지향",
        "평등 지향",
        "환경 친화",
        "자유 옹호",
      ]),
    },
    {
      id: "CEOD",
      name: "진보적 사회주의자",
      description:
        "변화와 평등을 지지하며 질서를 중시하고, 개발에 긍정적인 유형입니다.",
      traits: JSON.stringify([
        "혁신 지향",
        "평등 지향",
        "성장 중심",
        "규율 선호",
      ]),
    },
    {
      id: "CEON",
      name: "생태 사회주의자",
      description:
        "변화와 평등을 추구하며 질서를 존중하고, 환경 보존에 높은 가치를 두는 유형입니다.",
      traits: JSON.stringify([
        "혁신 지향",
        "평등 지향",
        "환경 친화",
        "규율 선호",
      ]),
    },
    {
      id: "SMFD",
      name: "자유주의적 보수",
      description:
        "안정을 선호하며 개인의 자유와 경쟁을 중시하고, 개발에 긍정적인 유형입니다.",
      traits: JSON.stringify([
        "안정 지향",
        "개인주의",
        "성장 중심",
        "자유 옹호",
      ]),
    },
    {
      id: "SMFN",
      name: "녹색 보수주의자",
      description:
        "안정과 자유를 중시하면서 경쟁을 지지하고, 환경 보존에 관심이 높은 유형입니다.",
      traits: JSON.stringify([
        "안정 지향",
        "개인주의",
        "환경 친화",
        "자유 옹호",
      ]),
    },
    {
      id: "SMOD",
      name: "전통적 보수주의자",
      description:
        "안정과 경쟁, 질서를 중시하며 발전을 위한 개발에 적극적인 유형입니다.",
      traits: JSON.stringify([
        "안정 지향",
        "질서 중시",
        "성장 중심",
        "규율 선호",
      ]),
    },
    {
      id: "SMON",
      name: "온건 보수주의자",
      description:
        "안정과 질서를 중시하며 경쟁을 지지하고, 환경 보존에도 관심을 가지는 유형입니다.",
      traits: JSON.stringify([
        "안정 지향",
        "질서 중시",
        "환경 친화",
        "규율 선호",
      ]),
    },
    {
      id: "SEFD",
      name: "사회민주주의자",
      description:
        "안정을 선호하며 평등과 자유를 중시하고, 개발에 긍정적인 유형입니다.",
      traits: JSON.stringify([
        "안정 지향",
        "평등 지향",
        "성장 중심",
        "자유 옹호",
      ]),
    },
    {
      id: "SEFN",
      name: "녹색 사민주의자",
      description:
        "안정과 평등, 자유를 중시하면서 환경 보존에 높은 가치를 두는 유형입니다.",
      traits: JSON.stringify([
        "안정 지향",
        "평등 지향",
        "환경 친화",
        "자유 옹호",
      ]),
    },
    {
      id: "SEOD",
      name: "온건 사회주의자",
      description:
        "안정과 평등, 질서를 중시하며 발전을 위한 개발에 긍정적인 유형입니다.",
      traits: JSON.stringify([
        "안정 지향",
        "평등 지향",
        "성장 중심",
        "규율 선호",
      ]),
    },
    {
      id: "SEON",
      name: "생태 보수주의자",
      description:
        "안정과 평등, 질서를 중시하며 환경 보존을 우선시하는 유형입니다.",
      traits: JSON.stringify([
        "안정 지향",
        "평등 지향",
        "환경 친화",
        "규율 선호",
      ]),
    },
  ];

  for (const resultType of dosResultTypes) {
    await prisma.dosResultType.upsert({
      where: { id: resultType.id },
      update: {
        name: resultType.name,
        description: resultType.description,
        traits: resultType.traits,
      },
      create: resultType,
    });
  }
  console.log(`DOS result types seeded: ${dosResultTypes.length} types`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const parties = [
    { name: '더불어민주당', color: '#004EA2', order: 1 },
    { name: '국민의힘', color: '#E61E2B', order: 2 },
    { name: '정의당', color: '#FFCC00', order: 3 },
    { name: '기본소득당', color: '#00D2C3', order: 4 },
    { name: '기타/무당층', color: '#808080', order: 5 },
  ];

  for (const party of parties) {
    await prisma.party.upsert({
      where: { name: party.name },
      update: { color: party.color, order: party.order },
      create: party,
    });
  }
  console.log('Parties seeded');

  // DOS 질문 시드
  // direction: 1 => 정방향(1~3이 첫번째 문자/높은%방향), -1 => 역방향(1~3이 두번째 문자/낮은%방향)
  // 변화축: C(Change) vs S(Stability) - 높은% = C
  // 분배축: M(Merit) vs E(Equality) - 높은% = M
  // 권리축: F(Freedom) vs O(Order) - 높은% = F  
  // 발전축: D(Development) vs N(Nature) - 높은% = D
  
  const dosQuestions = [
    // === 변화축 (change): C(변화) vs S(안정) ===
    { question: '오랫동안 유지되어 온 방식에는 그만한 이유가 있다고 생각한다.', axis: 'change', direction: -1 },
    { question: '새로운 시도와 변화는 사회를 더 나은 방향으로 이끈다고 느낀다.', axis: 'change', direction: 1 },
    { question: '급격한 변화보다는 점진적인 개선이 더 바람직하다고 생각한다.', axis: 'change', direction: -1 },
    { question: '기존의 방식을 과감히 바꾸는 것이 필요하다고 느끼는 경우가 많다.', axis: 'change', direction: 1 },
    { question: '오래된 동네의 불편함이 있더라도, 그 분위기가 유지되는 것은 가치가 있다고 생각한다.', axis: 'change', direction: -1 },
    { question: '새로운 기술이나 제도가 도입될 때, 완전히 자리 잡기 전까지는 기존 방식과 병행하는 편이 낫다.', axis: 'change', direction: -1 },
    { question: '익숙한 서비스가 전면 개편되었을 때, 적응하는 과정 자체가 사회 발전의 일부라고 생각한다.', axis: 'change', direction: 1 },
    { question: '당장 혼란이 있더라도 장기적으로 더 나아질 수 있다면 변화를 선택할 가치가 있다고 느낀다.', axis: 'change', direction: 1 },

    // === 분배축 (distribution): M(경쟁) vs E(평등) ===
    { question: '개인의 노력과 성취에 따른 보상 차이는 사회에서 자연스러운 현상이라고 생각한다.', axis: 'distribution', direction: 1 },
    { question: '사회 구성원 간의 격차를 줄이는 것이 사회 안정에 중요하다.', axis: 'distribution', direction: -1 },
    { question: '경제적 성과는 개인의 선택과 노력에 따라 달라지는 것이 당연하다.', axis: 'distribution', direction: 1 },
    { question: '기회와 자원은 사회 전체가 비교적으로 고르게 누릴 수 있어야 한다고 생각한다.', axis: 'distribution', direction: -1 },
    { question: '팀 프로젝트에서 결과가 뛰어난 사람이 더 많은 보상을 받는 것이 자연스럽다고 생각한다.', axis: 'distribution', direction: 1 },
    { question: '운이 좋았던 사람과 그렇지 않았던 사람 사이의 결과 차이를 사회가 어느 정도 보완해주어야 한다.', axis: 'distribution', direction: -1 },
    { question: '나는 수익이 높은 사람에게 높은 세금을 부과해 소득을 재분배하려는 정책에 대해 긍정적으로 생각한다.', axis: 'distribution', direction: -1 },
    { question: '입시 환경에서 지역에 따라 유리해지는 제도는 공정한 경쟁이 아니라고 생각한다.', axis: 'distribution', direction: 1 },

    // === 권리축 (rights): F(자유) vs O(규율) ===
    { question: '개인의 선택과 자유는 사회 규범보다 우선 시 되어야 한다.', axis: 'rights', direction: 1 },
    { question: '사회의 질서와 안전을 위해서는 일정 수준의 규율과 규제가 필요하다.', axis: 'rights', direction: -1 },
    { question: '공동의 안전을 위해 개인의 선택이 제한될 수 있다고 생각한다.', axis: 'rights', direction: -1 },
    { question: '사람마다 다르게 행동하는 것보다는 일정한 기준이 있는 편이 사회에 도움이 된다.', axis: 'rights', direction: -1 },
    { question: '정해진 규범보다는 개인의 사정이 더 중요하게 고려돼야 한다고 생각한다.', axis: 'rights', direction: 1 },
    { question: '공공장소에서 개인의 행동이 타인에게 불편함을 준다면 제한하는 것이 필요하다고 생각한다.', axis: 'rights', direction: -1 },
    { question: '안전벨트 필수 착용, 헬멧의 의무화 같은 교통 법규는 개인의 자유를 침해한다고 생각한다.', axis: 'rights', direction: 1 },
    { question: '나는 학생의 두발 및 복장의 자유는 당연한 권리라고 생각한다.', axis: 'rights', direction: 1 },

    // === 발전축 (development): D(개발) vs N(환경) ===
    { question: '장기적인 자연 보존을 위해 개발 속도를 조절하는 것은 필요하다고 생각한다.', axis: 'development', direction: -1 },
    { question: '기술 발전과 경제 성장을 위해 일정 수준의 환경 변화는 감수할 수 있다.', axis: 'development', direction: 1 },
    { question: '환경이 훼손된 이후 복구하는 것보다, 처음부터 보존하는 편이 더 중요하다.', axis: 'development', direction: -1 },
    { question: '국가 경쟁력을 높이기 위해서는 기술 개발을 우선 시 해야 한다.', axis: 'development', direction: 1 },
    { question: '산림에 스키장을 조성하는 계획이 있다면, 자연 훼손이 일부 발생하더라도 지역 경제와 관광지 활성화를 위해 추진할 수 있다고 생각한다.', axis: 'development', direction: 1 },
    { question: '신기술을 도입해 사회가 발전할 수 있다면, 기존 자연 환경을 일부 바꾸는 것은 고려할 수 있다.', axis: 'development', direction: 1 },
    { question: '훼손된 자연을 복구하는 데 드는 비용을 고려하면, 처음부터 개발을 제한하는 편이 낫다고 생각한다.', axis: 'development', direction: -1 },
    { question: '아마존 열대 우림을 개발하는 것은 기술의 발전보다는 악영향이 훨씬 많을 것이라고 예상된다.', axis: 'development', direction: -1 },
  ];

  await prisma.dosQuestion.deleteMany();
  
  for (const q of dosQuestions) {
    await prisma.dosQuestion.create({
      data: q,
    });
  }
  console.log(`DOS questions seeded: ${dosQuestions.length} questions`);

  // DOS 결과 유형은 너무 길어서 dosResultTypes.js 파일에서 가져옴!
  const { dosResultTypes } = await import('./dosResultTypes.js');

  for (const resultType of dosResultTypes) {
    await prisma.dosResultType.upsert({
      where: { id: resultType.id },
      update: { 
        name: resultType.name, 
        description: resultType.description, 
        detail: resultType.detail,
        features: resultType.features,
        tag: resultType.tag
      },
      create: resultType,
    });
  }
  console.log(`DOS result types seeded: ${dosResultTypes.length} types`);

  // 관리자 계정 시드(그냥 미리 만들어둠)
  if (process.env.ADMIN_PASSWORD) {
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: { role: 'ADMIN' },
      create: {
        email: 'admin@test.com',
        password: adminPassword,
        nickname: '운영자',
        age: 100,
        region: '서울',
        gender: 'MALE',
        role: 'ADMIN',
        points: 500,
      },
    });
    console.log('Admin user seeded');
  } else {
    console.log('ADMIN_PASSWORD not set, skipping admin user seed');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export const AGE_GROUPS = [
  { min: 18, max: 29, label: '20대' },
  { min: 30, max: 39, label: '30대' },
  { min: 40, max: 49, label: '40대' },
  { min: 50, max: 59, label: '50대' },
  { min: 60, max: 150, label: '60대 이상' },
];

export const getAgeGroup = (age) => {
  const group = AGE_GROUPS.find((g) => age >= g.min && age <= g.max);
  return group ? group.label : '기타';
};

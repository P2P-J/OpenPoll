import prisma from '../../config/database.js';

export const getAllParties = async () => {
  const parties = await prisma.party.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      color: true,
      voteCount: true,
    },
  });

  return parties;
};

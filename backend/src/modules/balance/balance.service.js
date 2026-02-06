import prisma from '../../config/database.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { POINT_TYPES, POINT_TYPE_DESCRIPTIONS } from '../../constants/pointTypes.js';

// 얘는 목록 조회고
export const getGames = async (userId = null) => {
  const games = await prisma.balanceGame.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  let myVotes = [];

  // 로그인 돼있으면 내 투표 확인 가능
  if (userId) {
    myVotes = await prisma.balanceVote.findMany({
      where: {
        userId,
        gameId: { in: games.map((g) => g.id) },
      },
      select: { gameId: true, isAgree: true },
    });
  }

  return games.map((game) => {
    const totalVotes = game.agreeCount + game.disagreeCount;
    const myVote = myVotes.find((v) => v.gameId === game.id);

    return {
      id: game.id,
      title: game.title,
      subtitle: game.subtitle,
      agreeCount: game.agreeCount,
      disagreeCount: game.disagreeCount,
      totalVotes,
      myVote: myVote ? myVote.isAgree : null,
      createdAt: game.createdAt,
    };
  });
};

// 얘는 상세 조회임(s 잘 보셈)
export const getGame = async (gameId, userId = null) => {
  const game = await prisma.balanceGame.findUnique({
    where: { id: gameId },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!game) {
    throw AppError.notFound('밸런스 게임을 찾을 수 없습니다.');
  }

  let myVote = null;

  // 로그인 돼있으면 내 투표 확인 가능
  if (userId) {
    const vote = await prisma.balanceVote.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });
    myVote = vote ? vote.isAgree : null;
  }

  const totalVotes = game.agreeCount + game.disagreeCount;

  return {
    id: game.id,
    title: game.title,
    description: game.description,
    agreeCount: game.agreeCount,
    disagreeCount: game.disagreeCount,
    totalVotes,
    commentCount: game._count.comments,
    myVote,
    createdAt: game.createdAt,
  };
};

export const vote = async (userId, gameId, isAgree) => {
  const game = await prisma.balanceGame.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw AppError.notFound('밸런스 게임을 찾을 수 없습니다.');
  }

  const existingVote = await prisma.balanceVote.findUnique({
    where: {
      userId_gameId: { userId, gameId },
    },
  });

  if (existingVote) {
    throw AppError.badRequest('이미 투표한 사안입니다.');
  }

  const result = await prisma.$transaction(async (tx) => {
    const vote = await tx.balanceVote.create({
      data: { userId, gameId, isAgree },
    });

    await tx.balanceGame.update({
      where: { id: gameId },
      data: isAgree
        ? { agreeCount: { increment: 1 } }
        : { disagreeCount: { increment: 1 } },
    });

    await tx.user.update({
      where: { id: userId },
      data: { points: { increment: config.points.balanceGame } },
    });

    await tx.pointHistory.create({
      data: {
        userId,
        type: POINT_TYPES.BALANCE_GAME,
        amount: config.points.balanceGame,
        description: `${POINT_TYPE_DESCRIPTIONS[POINT_TYPES.BALANCE_GAME]} - ${game.title}`,
      },
    });

    const updatedUser = await tx.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    return { vote, remainingPoints: updatedUser.points };
  });

  const updatedGame = await getGame(gameId, userId);

  return {
    ...updatedGame,
    pointsEarned: config.points.balanceGame,
    remainingPoints: result.remainingPoints,
  };
};

// 관리자: 추가
export const createGame = async (title, subtitle, description) => {
  const game = await prisma.balanceGame.create({
    data: { title, subtitle, description },
  });

  return game;
};

// 관리자: 수정
export const updateGame = async (gameId, updateData) => {
  const game = await prisma.balanceGame.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw AppError.notFound('밸런스 게임을 찾을 수 없습니다.');
  }

  const updatedGame = await prisma.balanceGame.update({
    where: { id: gameId },
    data: updateData,
  });

  return updatedGame;
};

// 관리자: 삭제
export const deleteGame = async (gameId) => {
  const game = await prisma.balanceGame.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw AppError.notFound('밸런스 게임을 찾을 수 없습니다.');
  }

  await prisma.balanceGame.delete({
    where: { id: gameId },
  });
};

export const getComments = async (gameId, userId = null) => {
  const game = await prisma.balanceGame.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw AppError.notFound('밸런스 게임을 찾을 수 없습니다.');
  }

  const comments = await prisma.balanceComment.findMany({
    where: {
      gameId,
      parentId: null,
    },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: { id: true, nickname: true },
      },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { id: true, nickname: true },
          },
          _count: {
            select: { likes: true },
          },
        },
      },
      _count: {
        select: { likes: true },
      },
    },
  });

  // 각 댓글 작성자의 투표 결과 조회
  const userIds = new Set();
  comments.forEach((c) => {
    userIds.add(c.userId);
    c.replies.forEach((r) => userIds.add(r.userId));
  });

  const votes = await prisma.balanceVote.findMany({
    where: {
      gameId,
      userId: { in: Array.from(userIds) },
    },
    select: { userId: true, isAgree: true },
  });

  const voteMap = new Map(votes.map((v) => [v.userId, v.isAgree]));

  // 로그인한 경우 내 좋아요 목록 조회
  let myLikes = new Set();
  if (userId) {
    const allCommentIds = [];
    comments.forEach((c) => {
      allCommentIds.push(c.id);
      c.replies.forEach((r) => allCommentIds.push(r.id));
    });

    const likes = await prisma.balanceCommentLike.findMany({
      where: {
        userId,
        commentId: { in: allCommentIds },
      },
      select: { commentId: true },
    });
    myLikes = new Set(likes.map((l) => l.commentId));
  }

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    likeCount: comment._count.likes,
    isLiked: userId ? myLikes.has(comment.id) : null,
    user: {
      id: comment.user.id,
      nickname: comment.user.nickname,
      isAgree: voteMap.get(comment.userId),
    },
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      likeCount: reply._count.likes,
      isLiked: userId ? myLikes.has(reply.id) : null,
      user: {
        id: reply.user.id,
        nickname: reply.user.nickname,
        isAgree: voteMap.get(reply.userId),
      },
    })),
  }));
};

export const toggleCommentLike = async (userId, commentId) => {
  const comment = await prisma.balanceComment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw AppError.notFound('댓글을 찾을 수 없습니다.');
  }

  const existingLike = await prisma.balanceCommentLike.findUnique({
    where: {
      userId_commentId: { userId, commentId },
    },
  });

  if (existingLike) {
    // 좋아요 취소
    await prisma.balanceCommentLike.delete({
      where: { id: existingLike.id },
    });
  } else {
    // 좋아요 추가
    await prisma.balanceCommentLike.create({
      data: { userId, commentId },
    });
  }

  const likeCount = await prisma.balanceCommentLike.count({
    where: { commentId },
  });

  return {
    commentId,
    likeCount,
    isLiked: !existingLike,
  };
};

export const createComment = async (userId, gameId, content, parentId = null) => {
  const game = await prisma.balanceGame.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw AppError.notFound('밸런스 게임을 찾을 수 없습니다.');
  }

  // 투표한 유저만 댓글 작성 가능
  const userVote = await prisma.balanceVote.findUnique({
    where: {
      userId_gameId: { userId, gameId },
    },
  });

  if (!userVote) {
    throw AppError.forbidden('투표한 유저만 댓글을 작성할 수 있습니다.');
  }

  if (parentId) {
    const parentComment = await prisma.balanceComment.findUnique({
      where: { id: parentId },
    });

    if (!parentComment || parentComment.gameId !== gameId) {
      throw AppError.notFound('부모 댓글을 찾을 수 없습니다.');
    }

    if (parentComment.parentId !== null) {
      throw AppError.badRequest('대댓글에는 답글을 달 수 없습니다.');
    }
  }

  const comment = await prisma.balanceComment.create({
    data: {
      userId,
      gameId,
      content,
      parentId,
    },
    include: {
      user: {
        select: { id: true, nickname: true },
      },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    user: {
      id: comment.user.id,
      nickname: comment.user.nickname,
      isAgree: userVote.isAgree,
    },
  };
};

export const deleteComment = async (userId, userRole, commentId) => {
  const comment = await prisma.balanceComment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw AppError.notFound('댓글을 찾을 수 없습니다.');
  }

  if (comment.userId !== userId && userRole !== 'ADMIN') {
    throw AppError.forbidden('본인의 댓글만 삭제할 수 있습니다.');
  }

  await prisma.balanceComment.delete({
    where: { id: commentId },
  });
};

export const updateComment = async (userId, userRole, commentId, content) => {
  const comment = await prisma.balanceComment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw AppError.notFound('댓글을 찾을 수 없습니다.');
  }

  if (comment.userId !== userId && userRole !== 'ADMIN') {
    throw AppError.forbidden('본인의 댓글만 수정할 수 있습니다.');
  }

  const updatedComment = await prisma.balanceComment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: {
        select: { id: true, nickname: true },
      },
    },
  });

  return updatedComment;
};

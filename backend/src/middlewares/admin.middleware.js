import AppError from '../utils/AppError.js';

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(AppError.forbidden('관리자 권한이 필요합니다.'));
  }
  next();
};

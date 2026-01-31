import AppError from '../utils/AppError.js';
import config from '../config/index.js';

const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.isDev) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  console.error('ERROR', err);
  return res.status(500).json({
    success: false,
    status: 'error',
    message: '서버 오류가 발생했습니다.',
  });
};

export default errorMiddleware;

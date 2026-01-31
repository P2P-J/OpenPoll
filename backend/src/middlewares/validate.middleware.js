import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: '입력값이 올바르지 않습니다.',
      errors: errorMessages,
    });
  }
  
  next();
};

export default validate;

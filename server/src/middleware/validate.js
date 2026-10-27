import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return sendError(res, 422, 'Validation failed. Please review the highlighted fields.', formatted);
  }
  next();
};

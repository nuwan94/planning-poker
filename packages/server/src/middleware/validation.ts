import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Room validation rules
export const createRoomValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Room name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];

export const updateRoomValidation = [
  param('id')
    .isLength({ min: 6, max: 6 })
    .withMessage('Room ID must be 6 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Room ID must contain only uppercase letters and numbers'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Room name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];

export const roomIdValidation = [
  param('id')
    .isLength({ min: 6, max: 6 })
    .withMessage('Room ID must be 6 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Room ID must contain only uppercase letters and numbers'),
  handleValidationErrors
];

// Story validation rules
export const createStoryValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Story title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Story title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('acceptanceCriteria')
    .optional()
    .isArray()
    .withMessage('Acceptance criteria must be an array'),
  body('acceptanceCriteria.*')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Each acceptance criteria must not exceed 500 characters'),
  body('roomId')
    .isLength({ min: 6, max: 6 })
    .withMessage('Room ID must be 6 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Room ID must contain only uppercase letters and numbers'),
  handleValidationErrors
];

export const updateStoryValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid story ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Story title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Story title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('acceptanceCriteria')
    .optional()
    .isArray()
    .withMessage('Acceptance criteria must be an array'),
  body('acceptanceCriteria.*')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Each acceptance criteria must not exceed 500 characters'),
  body('finalEstimate')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Final estimate must not exceed 20 characters'),
  handleValidationErrors
];

export const storyIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid story ID format'),
  handleValidationErrors
];

export const roomQueryValidation = [
  query('roomId')
    .isUUID()
    .withMessage('Invalid room ID format'),
  handleValidationErrors
];

// Vote validation
export const voteValidation = [
  body('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),
  body('value')
    .trim()
    .notEmpty()
    .withMessage('Vote value is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Vote value must be between 1 and 10 characters'),
  handleValidationErrors
];

// User join validation
export const joinRoomValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('User name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('User name must be between 1 and 100 characters'),
  body('isSpectator')
    .optional()
    .isBoolean()
    .withMessage('isSpectator must be a boolean'),
  handleValidationErrors
];
import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

/**
 * Middleware to handle validation result
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: 'error',
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details: errors.array(),
      },
    });
    return;
  }
  next();
};

/**
 * Validation rules for file operations
 */
export const validateFileOperation = [
  param('containerId').isUUID().withMessage('Container ID must be a valid UUID'),
  body('path')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Path must be between 1 and 500 characters'),
  body('content')
    .optional()
    .isLength({ max: 10 * 1024 * 1024 })
    .withMessage('Content must not exceed 10MB'),
  handleValidationErrors,
];

/**
 * Validation rules for git operations
 */
export const validateGitOperation = [
  param('containerId').isUUID().withMessage('Container ID must be a valid UUID'),
  body('url').optional().isURL().withMessage('URL must be a valid URL'),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('branch')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Branch name must be between 1 and 100 characters'),
  handleValidationErrors,
];

/**
 * Validation rules for terminal operations
 */
export const validateTerminalOperation = [
  param('containerId').isUUID().withMessage('Container ID must be a valid UUID'),
  body('command')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Command must be between 1 and 1000 characters'),
  body('cwd')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Working directory must be between 1 and 500 characters'),
  handleValidationErrors,
];

/**
 * Validation rules for computer-use operations
 */
export const validateComputerUseOperation = [
  param('containerId').isUUID().withMessage('Container ID must be a valid UUID'),
  body('x')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('X coordinate must be between 0 and 10000'),
  body('y')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Y coordinate must be between 0 and 10000'),
  body('text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Text must be between 1 and 10000 characters'),
  body('key')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Key must be between 1 and 50 characters'),
  handleValidationErrors,
];

/**
 * Validation rules for RAG search
 */
export const validateRAGSearch = [
  param('containerId').isUUID().withMessage('Container ID must be a valid UUID'),
  body('query')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Query must be between 1 and 500 characters'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

/**
 * Validation rules for container operations
 */
export const validateContainerOperation = [
  body('userId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be between 1 and 100 characters'),
  handleValidationErrors,
];

/**
 * Sanitize file path to prevent directory traversal
 */
export const sanitizeFilePath = (filePath: string): string => {
  // Remove any attempts at directory traversal
  return filePath
    .replace(/\.\./g, '') // Remove ..
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/^\/+/, '') // Remove leading slashes
    .trim();
};

/**
 * Validate command for security (used in terminal operations)
 */
export const validateCommandSecurity = (command: string): { isValid: boolean; reason?: string } => {
  const dangerousPatterns = [
    { pattern: /rm\s+-rf\s+\//, reason: 'Attempting to delete root filesystem' },
    { pattern: /sudo\s+rm/, reason: 'Attempting privileged file deletion' },
    { pattern: /curl.*\|.*sh/i, reason: 'Attempting to download and execute script' },
    { pattern: /wget.*\|.*bash/i, reason: 'Attempting to download and execute script' },
    { pattern: /dd\s+if=/, reason: 'Attempting direct disk manipulation' },
    { pattern: /passwd/, reason: 'Attempting to change passwords' },
    { pattern: /sudo\s+su/, reason: 'Attempting privilege escalation' },
    { pattern: /eval.*rm/i, reason: 'Attempting command injection with file deletion' },
    { pattern: /mount/, reason: 'Attempting filesystem mounting' },
    { pattern: /chmod\s+777\s+\//, reason: 'Attempting to change root permissions' },
  ];

  for (const { pattern, reason } of dangerousPatterns) {
    if (pattern.test(command)) {
      return { isValid: false, reason };
    }
  }

  return { isValid: true };
};

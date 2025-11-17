/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const config = require('../config/env');

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
}

/**
 * Error Handler
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log error in development
  if (config.isDevelopment()) {
    console.error('Error:', err);
  }

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: err.message,
      },
    });
  }

  // Validation errors (from Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors,
      },
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(config.isDevelopment() && { stack: err.stack }),
    },
  });
}

/**
 * Handle Prisma-specific errors
 * @param {Error} err - Prisma error
 * @param {object} res - Express response object
 */
function handlePrismaError(err, res) {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A record with this value already exists',
          field: err.meta?.target?.[0],
        },
      });

    case 'P2025':
      // Record not found
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      });

    case 'P2003':
      // Foreign key constraint violation
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid reference to related record',
        },
      });

    default:
      // Generic database error
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: config.isDevelopment() ? err.message : 'Database operation failed',
        },
      });
  }
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
};

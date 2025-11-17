/**
 * Request Validation Schemas
 * Uses Zod for schema validation
 */

const { z } = require('zod');

// User validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  initials: z.string().max(3).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  initials: z.string().max(3).optional(),
  email: z.string().email().optional(),
});

// Gig validation schemas
const createGigSchema = z.object({
  artist: z.string().min(1, 'Artist name is required').max(200),
  date: z.string().datetime('Invalid date format'),
  day: z.string().min(1).max(20),
  venue: z.string().min(1, 'Venue is required').max(200),
  location: z.string().min(1, 'Location is required').max(200),
  types: z.array(z.string()).min(1, 'At least one type is required'),
});

const updateGigSchema = z.object({
  artist: z.string().min(1).max(200).optional(),
  date: z.string().datetime().optional(),
  day: z.string().min(1).max(20).optional(),
  venue: z.string().min(1).max(200).optional(),
  location: z.string().min(1).max(200).optional(),
  types: z.array(z.string()).min(1).optional(),
});

const gigQuerySchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  location: z.string().optional(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  weekendOnly: z.enum(['true', 'false']).optional(),
  sort: z.enum(['date', 'artist', 'venue', 'location']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

// Interest validation schemas
const createInterestSchema = z.object({
  interestLevel: z.enum(['INTERESTED', 'VERY_INTERESTED', 'GOING']).optional(),
});

/**
 * Validate request body against a schema
 * @param {object} schema - Zod schema
 * @returns {function} Express middleware function
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

/**
 * Validate query parameters against a schema
 * @param {object} schema - Zod schema
 * @returns {function} Express middleware function
 */
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  updateUserSchema,
  createGigSchema,
  updateGigSchema,
  gigQuerySchema,
  createInterestSchema,

  // Validators
  validate,
  validateQuery,
};

/**
 * Authentication Routes
 * Defines routes for authentication endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, registerSchema, loginSchema } = require('../utils/validators');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', authController.refresh);

/**
 * GET /api/auth/me
 * Get current user
 * Requires authentication
 */
router.get('/me', authenticate, authController.getMe);

/**
 * POST /api/auth/logout
 * Logout user
 * Requires authentication
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;

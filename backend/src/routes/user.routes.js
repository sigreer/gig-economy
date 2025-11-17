/**
 * User Routes
 * Defines routes for user endpoints
 */

const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interest.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * GET /api/users/:id/interests
 * Get gigs a user is interested in
 * Requires authentication
 */
router.get('/:id/interests', authenticate, interestController.getUserInterests);

module.exports = router;

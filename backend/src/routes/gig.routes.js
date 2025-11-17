/**
 * Gig Routes
 * Defines routes for gig endpoints
 */

const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gig.controller');
const interestController = require('../controllers/interest.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const {
  validate,
  validateQuery,
  createGigSchema,
  updateGigSchema,
  gigQuerySchema,
  createInterestSchema,
} = require('../utils/validators');

/**
 * GET /api/gigs
 * Get all gigs with optional filters
 * Authentication optional
 */
router.get('/', optionalAuth, validateQuery(gigQuerySchema), gigController.getGigs);

/**
 * GET /api/gigs/:id
 * Get gig by ID
 * Authentication optional
 */
router.get('/:id', optionalAuth, gigController.getGigById);

/**
 * POST /api/gigs
 * Create a new gig
 * Requires authentication
 */
router.post('/', authenticate, validate(createGigSchema), gigController.createGig);

/**
 * PATCH /api/gigs/:id
 * Update a gig
 * Requires authentication
 */
router.patch('/:id', authenticate, validate(updateGigSchema), gigController.updateGig);

/**
 * DELETE /api/gigs/:id
 * Delete a gig
 * Requires authentication
 */
router.delete('/:id', authenticate, gigController.deleteGig);

/**
 * POST /api/gigs/:id/interest
 * Express interest in a gig
 * Requires authentication
 */
router.post('/:id/interest', authenticate, validate(createInterestSchema), interestController.expressInterest);

/**
 * DELETE /api/gigs/:id/interest
 * Remove interest from a gig
 * Requires authentication
 */
router.delete('/:id/interest', authenticate, interestController.removeInterest);

/**
 * GET /api/gigs/:id/interested
 * Get users interested in a gig
 * Authentication optional
 */
router.get('/:id/interested', optionalAuth, interestController.getInterestedUsers);

module.exports = router;

/**
 * Interest Controller
 * Handles HTTP requests for interest tracking
 */

const interestService = require('../services/interest.service');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Express interest in a gig
 * POST /api/gigs/:id/interest
 */
const expressInterest = asyncHandler(async (req, res) => {
  const gigId = req.params.id;
  const userId = req.user.id;
  const { interestLevel } = req.body;

  const interest = await interestService.expressInterest(gigId, userId, interestLevel);

  res.status(201).json({
    success: true,
    data: interest,
  });
});

/**
 * Remove interest from a gig
 * DELETE /api/gigs/:id/interest
 */
const removeInterest = asyncHandler(async (req, res) => {
  const gigId = req.params.id;
  const userId = req.user.id;

  await interestService.removeInterest(gigId, userId);

  res.status(200).json({
    success: true,
    data: {
      message: 'Interest removed successfully',
    },
  });
});

/**
 * Get users interested in a gig
 * GET /api/gigs/:id/interested
 */
const getInterestedUsers = asyncHandler(async (req, res) => {
  const gigId = req.params.id;
  const users = await interestService.getInterestedUsers(gigId);

  res.status(200).json({
    success: true,
    data: users,
  });
});

/**
 * Get gigs a user is interested in
 * GET /api/users/:id/interests
 */
const getUserInterests = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check if user is requesting their own interests or is an admin
  if (userId !== req.user.id && req.user.role !== 'ADMIN') {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const gigs = await interestService.getUserInterests(userId);

  res.status(200).json({
    success: true,
    data: gigs,
  });
});

module.exports = {
  expressInterest,
  removeInterest,
  getInterestedUsers,
  getUserInterests,
};

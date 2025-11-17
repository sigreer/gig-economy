/**
 * Gig Controller
 * Handles HTTP requests for gigs
 */

const gigService = require('../services/gig.service');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Get all gigs
 * GET /api/gigs
 */
const getGigs = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const result = await gigService.getGigs(req.query, userId);

  // Set total count header
  res.set('X-Total-Count', result.pagination.total.toString());

  res.status(200).json({
    success: true,
    data: result.gigs,
    pagination: result.pagination,
  });
});

/**
 * Get gig by ID
 * GET /api/gigs/:id
 */
const getGigById = asyncHandler(async (req, res) => {
  const gig = await gigService.getGigById(req.params.id);

  res.status(200).json({
    success: true,
    data: gig,
  });
});

/**
 * Create a new gig
 * POST /api/gigs
 */
const createGig = asyncHandler(async (req, res) => {
  const gig = await gigService.createGig(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: gig,
  });
});

/**
 * Update a gig
 * PATCH /api/gigs/:id
 */
const updateGig = asyncHandler(async (req, res) => {
  const gig = await gigService.updateGig(req.params.id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    data: gig,
  });
});

/**
 * Delete a gig
 * DELETE /api/gigs/:id
 */
const deleteGig = asyncHandler(async (req, res) => {
  await gigService.deleteGig(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: {
      message: 'Gig deleted successfully',
    },
  });
});

module.exports = {
  getGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
};

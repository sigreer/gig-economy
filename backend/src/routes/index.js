/**
 * Routes Index
 * Aggregates all routes
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const gigRoutes = require('./gig.routes');
const userRoutes = require('./user.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/gigs', gigRoutes);
router.use('/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

module.exports = router;

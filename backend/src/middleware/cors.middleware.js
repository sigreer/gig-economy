/**
 * CORS Middleware Configuration
 * Handles Cross-Origin Resource Sharing
 */

const cors = require('cors');
const config = require('../config/env');

/**
 * CORS configuration options
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
};

module.exports = cors(corsOptions);

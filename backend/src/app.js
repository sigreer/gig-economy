/**
 * Express Application Setup
 * Configures and exports Express app
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const config = require('./config/env');
const corsMiddleware = require('./middleware/cors.middleware');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const routes = require('./routes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Logging middleware
if (config.isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use(config.apiPrefix, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Gig Economy API',
      version: '1.0.0',
      environment: config.nodeEnv,
      endpoints: {
        health: `${config.apiPrefix}/health`,
        auth: `${config.apiPrefix}/auth`,
        gigs: `${config.apiPrefix}/gigs`,
        users: `${config.apiPrefix}/users`,
      },
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

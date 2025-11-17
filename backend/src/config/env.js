/**
 * Environment Configuration
 * Validates and exports environment variables
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api',

  // Database Configuration
  databaseUrl: process.env.DATABASE_URL,

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Bcrypt Configuration
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,

  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
  },

  // Helper functions
  isDevelopment: () => config.nodeEnv === 'development',
  isProduction: () => config.nodeEnv === 'production',
  isTest: () => config.nodeEnv === 'test',
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please create a .env file based on .env.example'
  );
}

// Warn about insecure JWT secrets in production
if (config.isProduction()) {
  const minSecretLength = 32;
  if (config.jwt.secret.length < minSecretLength || config.jwt.refreshSecret.length < minSecretLength) {
    console.warn('WARNING: JWT secrets should be at least 32 characters in production!');
  }
}

module.exports = config;

/**
 * JWT Utilities
 * Handles JWT token generation and verification
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate access token
 * @param {object} payload - Token payload (userId, email, role)
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Generate refresh token
 * @param {object} payload - Token payload (userId)
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} JWT token or null
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
};

/**
 * Authentication Middleware
 * Handles JWT verification and user authentication
 */

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const prisma = require('../config/database');

/**
 * Authenticate user using JWT token
 * Adds user object to request
 */
async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header or cookies
    const token = extractTokenFromHeader(req.headers.authorization) || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        initials: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.message.includes('token')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message,
        },
      });
    }
    next(error);
  }
}

/**
 * Authorize user based on roles
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {function} Express middleware function
 */
function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }

    next();
  };
}

/**
 * Optional authentication
 * Attaches user if token is present, but doesn't require it
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization) || req.cookies?.accessToken;

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          initials: true,
          role: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};

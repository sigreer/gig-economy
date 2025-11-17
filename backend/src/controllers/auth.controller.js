/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */

const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * Login a user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * Logout a user
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully',
    },
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const { verifyRefreshToken, generateAccessToken } = require('../utils/jwt');

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    const error = new Error('Refresh token not found');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Get user
  const user = await authService.getUserById(decoded.userId);

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
  refresh,
};

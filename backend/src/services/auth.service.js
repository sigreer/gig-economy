/**
 * Authentication Service
 * Handles user authentication business logic
 */

const prisma = require('../config/database');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} Created user and tokens
 */
async function register({ email, name, password, initials }) {
  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    const error = new Error(passwordValidation.errors.join(', '));
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    error.code = 'CONFLICT';
    throw error;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      initials: initials || name.substring(0, 2).toUpperCase(),
    },
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

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
}

/**
 * Login a user
 * @param {object} credentials - User login credentials
 * @returns {Promise<object>} User and tokens
 */
async function login({ email, password }) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} User object
 */
async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return user;
}

module.exports = {
  register,
  login,
  getUserById,
};

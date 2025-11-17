/**
 * Interest Service
 * Handles interest tracking business logic
 */

const prisma = require('../config/database');

/**
 * Express interest in a gig
 * @param {string} gigId - Gig ID
 * @param {string} userId - User ID
 * @param {string} interestLevel - Interest level
 * @returns {Promise<object>} Created interest
 */
async function expressInterest(gigId, userId, interestLevel = 'INTERESTED') {
  // Check if gig exists
  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
  });

  if (!gig) {
    const error = new Error('Gig not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Check if user already expressed interest
  const existingInterest = await prisma.interest.findUnique({
    where: {
      gigId_userId: {
        gigId,
        userId,
      },
    },
  });

  let interest;

  if (existingInterest) {
    // Update existing interest
    interest = await prisma.interest.update({
      where: { id: existingInterest.id },
      data: { interestLevel },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            initials: true,
          },
        },
        gig: {
          select: {
            id: true,
            artist: true,
            date: true,
            venue: true,
          },
        },
      },
    });
  } else {
    // Create new interest
    interest = await prisma.interest.create({
      data: {
        gigId,
        userId,
        interestLevel,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            initials: true,
          },
        },
        gig: {
          select: {
            id: true,
            artist: true,
            date: true,
            venue: true,
          },
        },
      },
    });
  }

  return {
    id: interest.id,
    gigId: interest.gigId,
    userId: interest.userId,
    interestLevel: interest.interestLevel,
    user: interest.user,
    gig: interest.gig,
    createdAt: interest.createdAt,
    updatedAt: interest.updatedAt,
  };
}

/**
 * Remove interest from a gig
 * @param {string} gigId - Gig ID
 * @param {string} userId - User ID
 */
async function removeInterest(gigId, userId) {
  // Check if interest exists
  const interest = await prisma.interest.findUnique({
    where: {
      gigId_userId: {
        gigId,
        userId,
      },
    },
  });

  if (!interest) {
    const error = new Error('Interest not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  await prisma.interest.delete({
    where: { id: interest.id },
  });
}

/**
 * Get users interested in a gig
 * @param {string} gigId - Gig ID
 * @returns {Promise<array>} List of interested users
 */
async function getInterestedUsers(gigId) {
  const interests = await prisma.interest.findMany({
    where: { gigId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          initials: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return interests.map(interest => ({
    id: interest.user.id,
    name: interest.user.name,
    initials: interest.user.initials,
    interest_level: interest.interestLevel,
    since: interest.createdAt,
  }));
}

/**
 * Get gigs a user is interested in
 * @param {string} userId - User ID
 * @returns {Promise<array>} List of gigs
 */
async function getUserInterests(userId) {
  const interests = await prisma.interest.findMany({
    where: { userId },
    include: {
      gig: {
        include: {
          types: {
            select: {
              type: true,
            },
          },
          addedBy: {
            select: {
              id: true,
              name: true,
              initials: true,
            },
          },
        },
      },
    },
    orderBy: {
      gig: {
        date: 'asc',
      },
    },
  });

  return interests.map(interest => ({
    id: interest.gig.id,
    artist: interest.gig.artist,
    date: interest.gig.date.toISOString(),
    day: interest.gig.day,
    venue: interest.gig.venue,
    location: interest.gig.location,
    type: interest.gig.types.map(t => t.type),
    added: interest.gig.addedBy ? {
      name: interest.gig.addedBy.name,
      initials: interest.gig.addedBy.initials,
    } : null,
    interestLevel: interest.interestLevel,
    interestedSince: interest.createdAt,
  }));
}

module.exports = {
  expressInterest,
  removeInterest,
  getInterestedUsers,
  getUserInterests,
};

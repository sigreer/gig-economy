/**
 * Gig Service
 * Handles gig-related business logic
 */

const prisma = require('../config/database');
const config = require('../config/env');

/**
 * Get all gigs with filtering and pagination
 * @param {object} filters - Query filters
 * @param {string} userId - Optional user ID for personalized data
 * @returns {Promise<object>} Gigs and pagination info
 */
async function getGigs(filters = {}, userId = null) {
  const {
    search,
    dateFrom,
    dateTo,
    location,
    type,
    weekendOnly,
    sort = 'date',
    order = 'asc',
    page = 1,
    limit = config.pagination.defaultPageSize,
  } = filters;

  // Build where clause
  const where = {};

  // Search filter
  if (search) {
    where.OR = [
      { artist: { contains: search, mode: 'insensitive' } },
      { venue: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  // Location filter
  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  // Type filter
  if (type) {
    const types = Array.isArray(type) ? type : [type];
    where.types = {
      some: {
        type: { in: types },
      },
    };
  }

  // Weekend only filter
  if (weekendOnly === 'true') {
    where.day = { in: ['Friday', 'Saturday', 'Sunday'] };
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit), config.pagination.maxPageSize);
  const skip = (pageNum - 1) * limitNum;

  // Get total count
  const total = await prisma.gig.count({ where });

  // Get gigs with relations
  const gigs = await prisma.gig.findMany({
    where,
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
      interests: {
        select: {
          id: true,
          interestLevel: true,
          user: {
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
      [sort]: order,
    },
    skip,
    take: limitNum,
  });

  // Transform data
  const transformedGigs = gigs.map(gig => ({
    id: gig.id,
    artist: gig.artist,
    date: gig.date.toISOString(),
    day: gig.day,
    venue: gig.venue,
    location: gig.location,
    type: gig.types.map(t => t.type),
    added: gig.addedBy ? {
      name: gig.addedBy.name,
      initials: gig.addedBy.initials,
      date: gig.createdAt.toISOString(),
    } : null,
    interested: gig.interests.map(i => ({
      id: i.user.id,
      name: i.user.name,
      initials: i.user.initials,
      interest_level: i.interestLevel,
    })),
    createdAt: gig.createdAt,
    updatedAt: gig.updatedAt,
  }));

  return {
    gigs: transformedGigs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Get gig by ID
 * @param {string} gigId - Gig ID
 * @returns {Promise<object>} Gig object
 */
async function getGigById(gigId) {
  const gig = await prisma.gig.findUnique({
    where: { id: gigId },
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
      interests: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              initials: true,
            },
          },
        },
      },
    },
  });

  if (!gig) {
    const error = new Error('Gig not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return {
    id: gig.id,
    artist: gig.artist,
    date: gig.date.toISOString(),
    day: gig.day,
    venue: gig.venue,
    location: gig.location,
    type: gig.types.map(t => t.type),
    added: gig.addedBy ? {
      name: gig.addedBy.name,
      initials: gig.addedBy.initials,
      date: gig.createdAt.toISOString(),
    } : null,
    interested: gig.interests.map(i => ({
      id: i.user.id,
      name: i.user.name,
      initials: i.user.initials,
      interest_level: i.interestLevel,
    })),
    createdAt: gig.createdAt,
    updatedAt: gig.updatedAt,
  };
}

/**
 * Create a new gig
 * @param {object} gigData - Gig data
 * @param {string} userId - User ID of creator
 * @returns {Promise<object>} Created gig
 */
async function createGig(gigData, userId) {
  const { artist, date, day, venue, location, types } = gigData;

  const gig = await prisma.gig.create({
    data: {
      artist,
      date: new Date(date),
      day,
      venue,
      location,
      addedById: userId,
      types: {
        create: types.map(type => ({ type })),
      },
    },
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
  });

  return {
    id: gig.id,
    artist: gig.artist,
    date: gig.date.toISOString(),
    day: gig.day,
    venue: gig.venue,
    location: gig.location,
    type: gig.types.map(t => t.type),
    added: {
      name: gig.addedBy.name,
      initials: gig.addedBy.initials,
      date: gig.createdAt.toISOString(),
    },
    interested: [],
    createdAt: gig.createdAt,
    updatedAt: gig.updatedAt,
  };
}

/**
 * Update a gig
 * @param {string} gigId - Gig ID
 * @param {object} gigData - Updated gig data
 * @param {string} userId - User ID
 * @returns {Promise<object>} Updated gig
 */
async function updateGig(gigId, gigData, userId) {
  // Check if gig exists and user has permission
  const existingGig = await prisma.gig.findUnique({
    where: { id: gigId },
    include: { addedBy: true },
  });

  if (!existingGig) {
    const error = new Error('Gig not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Check permission (only owner or admin can update)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (existingGig.addedById !== userId && user.role !== 'ADMIN') {
    const error = new Error('You do not have permission to update this gig');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const { artist, date, day, venue, location, types } = gigData;

  // Prepare update data
  const updateData = {};
  if (artist) updateData.artist = artist;
  if (date) updateData.date = new Date(date);
  if (day) updateData.day = day;
  if (venue) updateData.venue = venue;
  if (location) updateData.location = location;

  // Update gig
  const gig = await prisma.gig.update({
    where: { id: gigId },
    data: updateData,
    include: {
      types: true,
      addedBy: {
        select: {
          id: true,
          name: true,
          initials: true,
        },
      },
      interests: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              initials: true,
            },
          },
        },
      },
    },
  });

  // Update types if provided
  if (types && types.length > 0) {
    await prisma.gigType.deleteMany({ where: { gigId } });
    await prisma.gigType.createMany({
      data: types.map(type => ({ gigId, type })),
    });

    // Fetch updated types
    const updatedTypes = await prisma.gigType.findMany({
      where: { gigId },
      select: { type: true },
    });

    gig.types = updatedTypes;
  }

  return getGigById(gigId);
}

/**
 * Delete a gig
 * @param {string} gigId - Gig ID
 * @param {string} userId - User ID
 */
async function deleteGig(gigId, userId) {
  // Check if gig exists and user has permission
  const existingGig = await prisma.gig.findUnique({
    where: { id: gigId },
  });

  if (!existingGig) {
    const error = new Error('Gig not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Check permission
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (existingGig.addedById !== userId && user.role !== 'ADMIN') {
    const error = new Error('You do not have permission to delete this gig');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  await prisma.gig.delete({ where: { id: gigId } });
}

module.exports = {
  getGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
};

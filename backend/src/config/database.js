/**
 * Database Configuration
 * Initializes and exports Prisma Client
 */

const { PrismaClient } = require('@prisma/client');
const config = require('./env');

// Create Prisma Client instance
const prisma = new PrismaClient({
  log: config.isDevelopment()
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  errorFormat: config.isDevelopment() ? 'pretty' : 'minimal',
});

// Handle connection events
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Database connection closed');
  process.exit(0);
});

module.exports = prisma;

/**
 * Server Entry Point
 * Starts the Express server
 */

const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/database');

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Gig Economy API Server Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 API Endpoint: http://localhost:${PORT}${config.apiPrefix}`);
  console.log(`💚 Health Check: http://localhost:${PORT}${config.apiPrefix}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Close server
  server.close(async () => {
    console.log('✅ HTTP server closed');

    // Disconnect from database
    await prisma.$disconnect();
    console.log('✅ Database connection closed');

    console.log('👋 Goodbye!');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = server;

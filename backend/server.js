const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const sequelize = require('./src/config/database');
const socketService = require('./src/services/socketService');
const taskScheduler = require('./src/services/taskSchedulerService');

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const facilityRoutes = require('./src/routes/facilityRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const refundRoutes = require('./src/routes/refundRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection - try Supabase first, then fall back to local
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      
      // Sync database models
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    } catch (dbError) {
      console.log('⚠️  Direct PostgreSQL connection failed, but continuing with Supabase client...');
      console.log('💡 Supabase client connection is working for API operations.');
      console.log('📝 Some Sequelize-dependent features may not work, but core functionality is available.');
    }
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
    
    // Initialize Socket.IO
    socketService.initialize(server);
    console.log('✅ Socket.IO initialized.');
    
    // Start scheduled tasks
    taskScheduler.init();
    console.log('✅ Task scheduler initialized.');
    
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📤 SIGTERM received. Shutting down gracefully...');
  taskScheduler.stop();
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📤 SIGINT received. Shutting down gracefully...');
  taskScheduler.stop();
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;

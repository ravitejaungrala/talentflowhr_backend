const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://talenthr-front.onrender.com',
    'https://talentflowhr-frontend.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://unvraviteja_db_user:7OvBWcpfd3Ch82xa@raviteja.qofofnp.mongodb.net/talentflow-hr?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully');
})
.catch((error) => {
  console.error('❌ MongoDB Atlas connection error:', error);
  process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const feedbackRoutes = require('./routes/feedback');
const leaveRoutes = require('./routes/leaves');
const skillRoutes = require('./routes/skills');
const announcementRoutes = require('./routes/announcements');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'TalentFlow HR API Server',
    version: '1.0.0',
    status: 'Running',
    endpoints: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/employees',
      '/api/feedback',
      '/api/leaves',
      '/api/skills',
      '/api/announcements',
      '/health',
      '/api/test'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : error.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;

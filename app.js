const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://talentflowhr-frontend.netlify.app',
    'https://talentflow-hr-frontend.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'talentflow-secret-key-production-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  proxy: true // Trust the reverse proxy
}));

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://unvraviteja_db_user:7OvBWcpfd3Ch82xa@raviteja.qofofnp.mongodb.net/talentflow-hr?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas successfully');
})
.catch((error) => {
  console.error('MongoDB Atlas connection error:', error);
  process.exit(1);
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/recognition', require('./routes/recognition'));
app.use('/api/training', require('./routes/training'));
app.use('/api/surveys', require('./routes/surveys'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/documents', require('./routes/documents'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'TalentFlow HR API Server',
    version: '1.0.0',
    status: 'Running',
    frontend_url: 'https://talentflowhr-frontend.netlify.app',
    cors: 'Enabled'
  });
});

// Test route for CORS
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`CORS enabled for: ${[
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://talentflowhr-frontend.netlify.app'
  ].join(', ')}`);
});

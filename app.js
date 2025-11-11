const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

// ✅ STEP 1: Define allowed origins dynamically
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://talentflowhr-frontend.netlify.app'] // your deployed frontend
    : ['http://localhost:5173']; // your local React app

// ✅ STEP 2: Configure CORS middleware properly
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('❌ CORS not allowed for origin: ' + origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // allow cookies and authorization headers
  })
);

// ✅ STEP 3: Handle preflight (OPTIONS) requests globally
app.options('*', cors());

// ✅ STEP 4: Other middlewares
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'talentflow-secret-key-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ✅ STEP 5: MongoDB Atlas connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://unvraviteja_db_user:7OvBWcpfd3Ch82xa@raviteja.qofofnp.mongodb.net/talentflow-hr?retryWrites=true&w=majority';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully'))
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection error:', error);
    process.exit(1);
  });

// MongoDB events (optional for debugging)
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

// ✅ STEP 6: Import and use API routes
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

// ✅ STEP 7: Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    message: '✅ Server is running smoothly',
    database:
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ✅ STEP 8: Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TalentFlow HR API Server 🚀',
    version: '1.0.0',
    status: 'Running',
  });
});

// ✅ STEP 9: Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
  );
});

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'talentflow-jwt-secret-2024';

// JWT Authentication Middleware
const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Admin/HR Check Middleware
const requireAdminOrHR = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'hr') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or HR role required.' });
  }
};

module.exports = { authenticateJWT, requireAdminOrHR };

const express = require('express');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'talentflow-jwt-secret-2024';

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user from token
const getUserFromToken = async (req) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
};

// Middleware to check if user is admin or HR
const isAdminOrHR = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (user && (user.role === 'admin' || user.role === 'hr')) {
      req.user = user;
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin or HR role required.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all employees (Admin/HR only)
router.get('/', verifyToken, isAdminOrHR, async (req, res) => {
  try {
    console.log('Fetching employees for user:', req.user.role, req.user.id);
    const employees = await User.find({ 
      $or: [
        { role: 'employee' },
        { role: 'hr' },
        { role: 'admin' }
      ]
    }).select('-password').sort({ createdAt: -1 });
    console.log('Found employees:', employees.length);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employee
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { name, email, role, isActive } = req.body;
    
    // Check permissions
    if (user.role !== 'admin' && user.role !== 'hr' && user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { name, email, role, isActive };
    
    // Only admin can change role to admin
    if (user.role !== 'admin' && role === 'admin') {
      return res.status(403).json({ message: 'Only admin can assign admin role' });
    }

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete employee (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

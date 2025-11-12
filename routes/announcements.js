const express = require('express');
const Announcement = require('../models/Announcement');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Middleware to check if user is admin or HR
const isAdminOrHR = (req, res, next) => {
  if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or HR role required.' });
  }
};

// Get all announcements
router.get('/', isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching announcements for user:', req.session.userRole, req.session.userId);
    
    const announcements = await Announcement.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found announcements:', announcements.length);
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create announcement (Admin/HR only)
router.post('/', isAuthenticated, isAdminOrHR, async (req, res) => {
  try {
    const { title, content, priority, targetAudience } = req.body;
    
    console.log('Creating announcement by user:', req.session.userId);
    
    const announcement = new Announcement({
      title,
      content,
      priority,
      targetAudience,
      author: req.session.userId
    });

    await announcement.save();
    await announcement.populate('author', 'name email');

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

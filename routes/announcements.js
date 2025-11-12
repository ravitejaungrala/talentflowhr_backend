const express = require('express');
const Announcement = require('../models/Announcement');
const { authenticateJWT, requireAdminOrHR } = require('../middleware/auth');
const router = express.Router();

// Get all announcements
router.get('/', authenticateJWT, async (req, res) => {
  try {
    console.log('Fetching announcements for user:', req.user.role, req.user.id);
    
    const announcements = await Announcement.find({ isActive: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found announcements:', announcements.length);
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ 
      message: 'Server error fetching announcements', 
      error: error.message 
    });
  }
});

// Create announcement (Admin/HR only)
router.post('/', authenticateJWT, requireAdminOrHR, async (req, res) => {
  try {
    const { title, content, priority, targetAudience, department, role } = req.body;
    
    console.log('Creating announcement by user:', req.user.id);
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const announcement = new Announcement({
      title,
      content,
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      department,
      role,
      author: req.user.id
    });

    await announcement.save();
    await announcement.populate('author', 'name email');

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ 
      message: 'Server error creating announcement', 
      error: error.message 
    });
  }
});

module.exports = router;

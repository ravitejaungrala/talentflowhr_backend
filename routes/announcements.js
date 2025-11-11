const express = require('express');
const Announcement = require('../models/Announcement');
const router = express.Router();

// Get announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('author', 'name email department position')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create announcement
router.post('/', async (req, res) => {
  try {
    if (req.session.userRole !== 'admin' && req.session.userRole !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const announcement = new Announcement({
      ...req.body,
      author: req.session.userId
    });
    await announcement.save();
    await announcement.populate('author', 'name email department position');
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
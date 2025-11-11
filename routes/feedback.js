const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const router = express.Router();

// Get all feedback (with permissions)
router.get('/', async (req, res) => {
  try {
    let feedback;
    if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
      feedback = await Feedback.find()
        .populate('fromEmployee', 'name email')
        .populate('toEmployee', 'name email')
        .sort({ createdAt: -1 });
    } else {
      feedback = await Feedback.find({
        $or: [
          { fromEmployee: req.session.userId },
          { toEmployee: req.session.userId }
        ]
      })
      .populate('fromEmployee', 'name email')
      .populate('toEmployee', 'name email')
      .sort({ createdAt: -1 });
    }
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create feedback
router.post('/', async (req, res) => {
  try {
    const { toEmployee, message, category, isAnonymous } = req.body;
    
    const feedback = new Feedback({
      fromEmployee: req.session.userId,
      toEmployee,
      message,
      category,
      isAnonymous
    });

    await feedback.save();
    await feedback.populate('fromEmployee', 'name email');
    await feedback.populate('toEmployee', 'name email');

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update feedback
router.put('/:id', async (req, res) => {
  try {
    const { message, category } = req.body;
    
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      fromEmployee: req.session.userId
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or access denied' });
    }

    feedback.message = message;
    feedback.category = category;
    await feedback.save();

    await feedback.populate('fromEmployee', 'name email');
    await feedback.populate('toEmployee', 'name email');

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      fromEmployee: req.session.userId
    });

    if (!feedback) {
      // Check if admin/HR trying to delete
      if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
        const adminFeedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!adminFeedback) {
          return res.status(404).json({ message: 'Feedback not found' });
        }
        return res.json({ message: 'Feedback deleted successfully' });
      }
      return res.status(404).json({ message: 'Feedback not found or access denied' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const Feedback = require('../models/Feedback');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Get all feedback (with permissions)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let feedback;
    console.log('Fetching feedback for user:', req.session.userRole, req.session.userId);
    
    if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
      feedback = await Feedback.find()
        .populate('fromEmployee', 'name email department')
        .populate('toEmployee', 'name email department')
        .sort({ createdAt: -1 });
    } else {
      feedback = await Feedback.find({
        $or: [
          { fromEmployee: req.session.userId },
          { toEmployee: req.session.userId }
        ]
      })
      .populate('fromEmployee', 'name email department')
      .populate('toEmployee', 'name email department')
      .sort({ createdAt: -1 });
    }
    
    console.log('Found feedback:', feedback.length);
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create feedback
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { toEmployee, message, category, isAnonymous } = req.body;
    
    console.log('Creating feedback from:', req.session.userId, 'to:', toEmployee);
    
    const feedback = new Feedback({
      fromEmployee: req.session.userId,
      toEmployee,
      message,
      category,
      isAnonymous
    });

    await feedback.save();
    await feedback.populate('fromEmployee', 'name email department');
    await feedback.populate('toEmployee', 'name email department');

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update feedback
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { message, category, isAnonymous } = req.body;
    
    let feedback;
    if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
      feedback = await Feedback.findById(req.params.id);
    } else {
      feedback = await Feedback.findOne({
        _id: req.params.id,
        fromEmployee: req.session.userId
      });
    }

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or access denied' });
    }

    feedback.message = message;
    feedback.category = category;
    feedback.isAnonymous = isAnonymous;
    await feedback.save();

    await feedback.populate('fromEmployee', 'name email department');
    await feedback.populate('toEmployee', 'name email department');

    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete feedback
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    let feedback;
    if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
      feedback = await Feedback.findById(req.params.id);
    } else {
      feedback = await Feedback.findOne({
        _id: req.params.id,
        fromEmployee: req.session.userId
      });
    }

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or access denied' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const Feedback = require('../models/Feedback');
const { authenticateJWT, requireAdminOrHR } = require('../middleware/auth');
const router = express.Router();

// Get all feedback (with permissions)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let feedback;
    console.log('Fetching feedback for user:', req.user.role, req.user.id);
    
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      feedback = await Feedback.find()
        .populate('fromEmployee', 'name email department')
        .populate('toEmployee', 'name email department')
        .sort({ createdAt: -1 });
    } else {
      feedback = await Feedback.find({
        $or: [
          { fromEmployee: req.user.id },
          { toEmployee: req.user.id }
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
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { toEmployee, message, category, isAnonymous } = req.body;
    
    console.log('Creating feedback from:', req.user.id, 'to:', toEmployee);
    
    const feedback = new Feedback({
      fromEmployee: req.user.id,
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
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { message, category, isAnonymous } = req.body;
    
    let feedback;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      feedback = await Feedback.findById(req.params.id);
    } else {
      feedback = await Feedback.findOne({
        _id: req.params.id,
        fromEmployee: req.user.id
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
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    let feedback;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      feedback = await Feedback.findById(req.params.id);
    } else {
      feedback = await Feedback.findOne({
        _id: req.params.id,
        fromEmployee: req.user.id
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

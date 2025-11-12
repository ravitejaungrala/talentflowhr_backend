const express = require('express');
const Feedback = require('../models/Feedback');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Get all feedback (admin/hr see all, employees see only their feedback)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let feedbacks;
    
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      // Admin/HR can see all feedback
      feedbacks = await Feedback.find()
        .populate('fromEmployee', 'name email department position')
        .populate('toEmployee', 'name email department position')
        .sort({ createdAt: -1 });
    } else {
      // Employees can only see feedback they sent or received
      feedbacks = await Feedback.find({
        $or: [
          { fromEmployee: req.user.id },
          { toEmployee: req.user.id }
        ]
      })
        .populate('fromEmployee', 'name email department position')
        .populate('toEmployee', 'name email department position')
        .sort({ createdAt: -1 });
    }
    
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new feedback
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { toEmployee, message, category, isAnonymous } = req.body;

    // Validate required fields
    if (!toEmployee || !message) {
      return res.status(400).json({ message: 'Recipient and message are required' });
    }

    // Employees cannot send feedback to themselves
    if (toEmployee === req.user.id) {
      return res.status(400).json({ message: 'Cannot send feedback to yourself' });
    }

    const feedback = new Feedback({
      fromEmployee: req.user.id,
      toEmployee,
      message,
      category: category || 'general',
      isAnonymous: isAnonymous || false
    });

    await feedback.save();
    
    // Populate the saved feedback with full employee details
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('fromEmployee', 'name email department position')
      .populate('toEmployee', 'name email department position');
    
    res.status(201).json(populatedFeedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update feedback
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { message, category, isAnonymous } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Only the sender or admin/hr can edit feedback
    if (feedback.fromEmployee.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    feedback.message = message || feedback.message;
    feedback.category = category || feedback.category;
    feedback.isAnonymous = isAnonymous !== undefined ? isAnonymous : feedback.isAnonymous;

    await feedback.save();
    
    // Populate the updated feedback
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('fromEmployee', 'name email department position')
      .populate('toEmployee', 'name email department position');
    
    res.json(populatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete feedback
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Only the sender or admin/hr can delete feedback
    if (feedback.fromEmployee.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

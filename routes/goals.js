const express = require('express');
const Goal = require('../models/Goal');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Get goals
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let goals;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      goals = await Goal.find()
        .populate('employee', 'name email department position')
        .populate('assignedBy', 'name email');
    } else {
      goals = await Goal.find({ employee: req.user.id })
        .populate('employee', 'name email department position')
        .populate('assignedBy', 'name email');
    }
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create goal
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      employee: req.body.employee || req.user.id,
      assignedBy: req.user.id
    });
    await goal.save();
    await goal.populate('employee', 'name email department position');
    await goal.populate('assignedBy', 'name email');
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update goal progress
router.patch('/:id/progress', authenticateJWT, async (req, res) => {
  try {
    const { progress, status } = req.body;
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.employee.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    goal.progress = progress;
    if (status) goal.status = status;
    if (progress >= 100) goal.status = 'completed';

    await goal.save();
    await goal.populate('employee', 'name email department position');
    await goal.populate('assignedBy', 'name email');
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

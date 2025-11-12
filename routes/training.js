const express = require('express');
const Training = require('../models/Training');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Get all training
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const training = await Training.find()
      .populate('enrolledEmployees.employee', 'name email department position');
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create training
router.post('/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const training = new Training(req.body);
    await training.save();
    res.status(201).json(training);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enroll in training
router.post('/:id/enroll', authenticateJWT, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }

    const existingEnrollment = training.enrolledEmployees.find(
      enrollment => enrollment.employee && enrollment.employee.toString() === req.user.id
    );

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this training' });
    }

    training.enrolledEmployees.push({
      employee: req.user.id,
      progress: 0
    });

    await training.save();
    await training.populate('enrolledEmployees.employee', 'name email department position');
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update training progress
router.patch('/:id/progress', authenticateJWT, async (req, res) => {
  try {
    const { progress } = req.body;
    const training = await Training.findById(req.params.id);
    
    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }

    const enrollment = training.enrolledEmployees.find(
      e => e.employee && e.employee.toString() === req.user.id
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this training' });
    }

    enrollment.progress = progress;
    if (progress >= 100) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
    }

    await training.save();
    await training.populate('enrolledEmployees.employee', 'name email department position');
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

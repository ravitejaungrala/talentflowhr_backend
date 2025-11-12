const express = require('express');
const Survey = require('../models/Survey');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Get all surveys
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const surveys = await Survey.find()
      .populate('responses.employee', 'name email department');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create survey
router.post('/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const survey = new Survey(req.body);
    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit survey response
router.post('/:id/respond', authenticateJWT, async (req, res) => {
  try {
    const { answers } = req.body;
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const existingResponse = survey.responses.find(
      response => response.employee && response.employee.toString() === req.user.id
    );

    if (existingResponse) {
      return res.status(400).json({ message: 'Already responded to this survey' });
    }

    survey.responses.push({
      employee: req.user.id,
      answers
    });

    await survey.save();
    await survey.populate('responses.employee', 'name email department');
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

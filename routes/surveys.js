const express = require('express');
const Survey = require('../models/Survey');
const router = express.Router();

// Get all surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.find()
      .populate('author', 'name email')
      .populate('responses.employee', 'name email department');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create survey
router.post('/', async (req, res) => {
  try {
    const survey = new Survey({
      ...req.body,
      author: req.session.userId
    });
    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit survey response
router.post('/:id/respond', async (req, res) => {
  try {
    const { answers } = req.body;
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const existingResponse = survey.responses.find(
      response => response.employee.toString() === req.session.userId
    );

    if (existingResponse) {
      return res.status(400).json({ message: 'Already responded to this survey' });
    }

    survey.responses.push({
      employee: req.session.userId,
      answers
    });

    await survey.save();
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
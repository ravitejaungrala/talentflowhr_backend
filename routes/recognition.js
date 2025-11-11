const express = require('express');
const Recognition = require('../models/Recognition');
const router = express.Router();

// Get all recognition
router.get('/', async (req, res) => {
  try {
    const recognition = await Recognition.find()
      .populate('fromEmployee', 'name email department position')
      .populate('toEmployee', 'name email department position')
      .sort({ createdAt: -1 });
    res.json(recognition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create recognition
router.post('/', async (req, res) => {
  try {
    const { toEmployee, category, message, points, isPublic, tags } = req.body;
    
    const recognition = new Recognition({
      fromEmployee: req.session.userId,
      toEmployee,
      category,
      message,
      points,
      isPublic,
      tags
    });

    await recognition.save();
    await recognition.populate('fromEmployee', 'name email department position');
    await recognition.populate('toEmployee', 'name email department position');

    res.status(201).json(recognition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recognition leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Recognition.aggregate([
      {
        $group: {
          _id: '$toEmployee',
          totalPoints: { $sum: '$points' },
          recognitionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $project: {
          'employee.name': 1,
          'employee.department': 1,
          'employee.position': 1,
          totalPoints: 1,
          recognitionCount: 1
        }
      },
      {
        $sort: { totalPoints: -1 }
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const Skill = require('../models/Skill');
const { authenticateJWT, requireAdminOrHR } = require('../middleware/auth');
const router = express.Router();

// Get all skills (with permissions)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let skills;
    console.log('Fetching skills for user:', req.user.role, req.user.id);
    
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      skills = await Skill.find()
        .populate('employee', 'name email department position')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      skills = await Skill.find({ employee: req.user.id })
        .populate('employee', 'name email department position')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 });
    }
    
    console.log('Found skills:', skills.length);
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create skill
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, category, proficiency, yearsOfExperience } = req.body;
    
    console.log('Creating skill for user:', req.user.id);
    
    const skill = new Skill({
      employee: req.user.id,
      name,
      category,
      proficiency,
      yearsOfExperience
    });

    await skill.save();
    await skill.populate('employee', 'name email department position');

    res.status(201).json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update skill
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, category, proficiency, yearsOfExperience } = req.body;
    
    let skill;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      skill = await Skill.findById(req.params.id);
    } else {
      skill = await Skill.findOne({
        _id: req.params.id,
        employee: req.user.id
      });
    }

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found or access denied' });
    }

    skill.name = name;
    skill.category = category;
    skill.proficiency = proficiency;
    skill.yearsOfExperience = yearsOfExperience;
    await skill.save();

    await skill.populate('employee', 'name email department position');

    res.json(skill);
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify skill (Admin/HR only)
router.patch('/:id/verify', authenticateJWT, requireAdminOrHR, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { 
        isVerified: true,
        verifiedBy: req.user.id
      },
      { new: true, runValidators: true }
    ).populate('employee', 'name email department position')
     .populate('verifiedBy', 'name email');

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    console.error('Error verifying skill:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete skill
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    let skill;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      skill = await Skill.findById(req.params.id);
    } else {
      skill = await Skill.findOne({
        _id: req.params.id,
        employee: req.user.id
      });
    }

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found or access denied' });
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

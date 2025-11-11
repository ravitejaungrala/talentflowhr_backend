const express = require('express');
const Skill = require('../models/Skill');
const router = express.Router();

// Get all skills (with permissions)
router.get('/', async (req, res) => {
  try {
    let skills;
    if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
      skills = await Skill.find()
        .populate('employee', 'name email department position')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      skills = await Skill.find({ employee: req.session.userId })
        .populate('employee', 'name email department position')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 });
    }
    
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create skill
router.post('/', async (req, res) => {
  try {
    const { name, category, proficiency, yearsOfExperience } = req.body;
    
    const skill = new Skill({
      employee: req.session.userId,
      name,
      category,
      proficiency,
      yearsOfExperience
    });

    await skill.save();
    await skill.populate('employee', 'name email department position');

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update skill
router.put('/:id', async (req, res) => {
  try {
    const { name, category, proficiency, yearsOfExperience } = req.body;
    
    const skill = await Skill.findOne({
      _id: req.params.id,
      employee: req.session.userId
    });

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify skill (Admin/HR only)
router.patch('/:id/verify', async (req, res) => {
  try {
    if (req.session.userRole !== 'admin' && req.session.userRole !== 'hr') {
      return res.status(403).json({ message: 'Access denied. Admin or HR role required.' });
    }

    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { 
        isVerified: true,
        verifiedBy: req.session.userId
      },
      { new: true, runValidators: true }
    ).populate('employee', 'name email department position')
     .populate('verifiedBy', 'name email');

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete skill
router.delete('/:id', async (req, res) => {
  try {
    const skill = await Skill.findOne({
      _id: req.params.id,
      employee: req.session.userId
    });

    if (!skill) {
      // Check if admin/HR trying to delete
      if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
        const adminSkill = await Skill.findByIdAndDelete(req.params.id);
        if (!adminSkill) {
          return res.status(404).json({ message: 'Skill not found' });
        }
        return res.json({ message: 'Skill deleted successfully' });
      }
      return res.status(404).json({ message: 'Skill not found or access denied' });
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
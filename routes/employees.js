const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to check if user is admin or HR
const isAdminOrHR = (req, res, next) => {
  if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or HR role required.' });
  }
};

// Get all employees (Admin/HR only)
router.get('/', isAdminOrHR, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Employees can only view their own profile, unless admin/HR
    if (req.session.userRole !== 'admin' && req.session.userRole !== 'hr' && 
        req.session.userId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { name, department, position } = req.body;
    
    // Check permissions
    if (req.session.userRole !== 'admin' && req.session.userRole !== 'hr' && 
        req.session.userId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { name, department, position },
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete employee (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.session.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
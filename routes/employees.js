const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to check if user is admin or HR
const isAdminOrHR = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'hr') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or HR role required.' });
  }
};

// Get all employees (Admin/HR only)
router.get('/', isAdminOrHR, async (req, res) => {
  try {
    console.log('Fetching employees for user:', req.user?.role, req.user?.id);
    const employees = await User.find({ 
      $or: [
        { role: 'employee' },
        { role: 'hr' }
      ]
    }).select('-password').sort({ createdAt: -1 });
    console.log('Found employees:', employees.length);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
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
    if (req.user?.role !== 'admin' && req.user?.role !== 'hr' && 
        req.user?.id !== req.params.id) {
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
    const { name, email, role, isActive } = req.body;
    
    // Check permissions
    if (req.user?.role !== 'admin' && req.user?.role !== 'hr' && 
        req.user?.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { name, email, role, isActive };
    
    // Only admin can change role to admin
    if (req.user?.role !== 'admin' && role === 'admin') {
      return res.status(403).json({ message: 'Only admin can assign admin role' });
    }

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Prevent self-deletion
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
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

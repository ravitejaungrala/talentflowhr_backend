const express = require('express');
const User = require('../models/User');
const { authenticateJWT, requireAdminOrHR } = require('../middleware/auth');
const router = express.Router();

// Get all employees (Admin/HR only)

// Get all employees (accessible to all authenticated users for feedback/recognition)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Filter out the current user to prevent self-feedback/recognition
    const employees = await User.find({ 
      isActive: true,
      _id: { $ne: req.user.id } // Exclude current user
    })
      .select('name email department position role')
      .sort({ name: 1 });
    
    console.log(`Fetched ${employees.length} employees for user ${req.user.id}`);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create employee (admin/HR only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = new User(req.body);
    await employee.save();
    
    // Return without password
    const employeeWithoutPassword = await User.findById(employee._id).select('-password');
    res.status(201).json(employeeWithoutPassword);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employee
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { name, email, role, isActive };
    
    // Only admin can change role to admin
    if (req.user.role !== 'admin' && role === 'admin') {
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
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
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

const express = require('express');
const Leave = require('../models/Leave');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Get all leaves (with permissions)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let leaves;
    console.log('Fetching leaves for user:', req.session.userRole, req.session.userId);
    
    if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
      leaves = await Leave.find()
        .populate('employee', 'name email department position')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      leaves = await Leave.find({ employee: req.session.userId })
        .populate('employee', 'name email department position')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 });
    }
    
    console.log('Found leaves:', leaves.length);
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create leave request
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    console.log('Creating leave for user:', req.session.userId);
    
    const leave = new Leave({
      employee: req.session.userId,
      leaveType,
      startDate,
      endDate,
      reason
    });

    await leave.save();
    await leave.populate('employee', 'name email department position');

    res.status(201).json(leave);
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update leave request
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    let leave;
    if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
      leave = await Leave.findById(req.params.id);
    } else {
      leave = await Leave.findOne({
        _id: req.params.id,
        employee: req.session.userId
      });
    }

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found or access denied' });
    }

    leave.leaveType = leaveType;
    leave.startDate = startDate;
    leave.endDate = endDate;
    leave.reason = reason;
    await leave.save();

    await leave.populate('employee', 'name email department position');

    res.json(leave);
  } catch (error) {
    console.error('Error updating leave:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/Reject leave (Admin/HR only)
router.patch('/:id/status', isAuthenticated, async (req, res) => {
  try {
    if (req.session.userRole !== 'admin' && req.session.userRole !== 'hr') {
      return res.status(403).json({ message: 'Access denied. Admin or HR role required.' });
    }

    const { status, notes } = req.body;
    
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        approvedBy: req.session.userId,
        notes
      },
      { new: true, runValidators: true }
    ).populate('employee', 'name email department position')
     .populate('approvedBy', 'name email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leave);
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete leave request
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    let leave;
    if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
      leave = await Leave.findById(req.params.id);
    } else {
      leave = await Leave.findOne({
        _id: req.params.id,
        employee: req.session.userId
      });
    }

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found or access denied' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

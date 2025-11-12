const express = require('express');
const Leave = require('../models/Leave');
const { authenticateJWT, requireAdminOrHR } = require('../middleware/auth');
const router = express.Router();

// Get all leaves (with permissions)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    console.log('Fetching leaves for user:', req.user.role, req.user.id);
    
    let leaves;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      leaves = await Leave.find()
        .populate('employee', 'name email department position')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      leaves = await Leave.find({ employee: req.user.id })
        .populate('employee', 'name email department position')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 });
    }
    
    console.log('Found leaves:', leaves.length);
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ 
      message: 'Server error fetching leaves', 
      error: error.message 
    });
  }
});

// Create leave request
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    console.log('Creating leave for user:', req.user.id);
    
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        message: 'Leave type, start date, end date, and reason are required' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const leave = new Leave({
      employee: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      reason
    });

    await leave.save();
    await leave.populate('employee', 'name email department position');

    res.status(201).json(leave);
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({ 
      message: 'Server error creating leave', 
      error: error.message 
    });
  }
});

// Update leave request
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    let leave;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      leave = await Leave.findById(req.params.id);
    } else {
      leave = await Leave.findOne({
        _id: req.params.id,
        employee: req.user.id,
        status: 'pending' // Only allow editing pending leaves
      });
    }

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found or access denied' });
    }

    // Only allow editing pending leaves
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leaves can be edited' });
    }

    leave.leaveType = leaveType || leave.leaveType;
    leave.startDate = startDate ? new Date(startDate) : leave.startDate;
    leave.endDate = endDate ? new Date(endDate) : leave.endDate;
    leave.reason = reason || leave.reason;
    
    await leave.save();
    await leave.populate('employee', 'name email department position');

    res.json(leave);
  } catch (error) {
    console.error('Error updating leave:', error);
    res.status(500).json({ 
      message: 'Server error updating leave', 
      error: error.message 
    });
  }
});

// Approve/Reject leave (Admin/HR only)
router.patch('/:id/status', authenticateJWT, requireAdminOrHR, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (approved/rejected) is required' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        approvedBy: req.user.id,
        notes: notes || ''
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
    res.status(500).json({ 
      message: 'Server error updating leave status', 
      error: error.message 
    });
  }
});

// Delete leave request
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    let leave;
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      leave = await Leave.findById(req.params.id);
    } else {
      leave = await Leave.findOne({
        _id: req.params.id,
        employee: req.user.id,
        status: 'pending' // Only allow deleting pending leaves
      });
    }

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found or access denied' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave:', error);
    res.status(500).json({ 
      message: 'Server error deleting leave', 
      error: error.message 
    });
  }
});

module.exports = router;

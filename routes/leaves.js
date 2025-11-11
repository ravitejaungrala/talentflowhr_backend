const express = require('express');
const Leave = require('../models/Leave');
const router = express.Router();

// Get all leaves (with permissions)
router.get('/', async (req, res) => {
  try {
    let leaves;
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
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create leave request
router.post('/', async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update leave request
router.put('/:id', async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.session.userId
    });

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/Reject leave (Admin/HR only)
router.patch('/:id/status', async (req, res) => {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete leave request
router.delete('/:id', async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.session.userId
    });

    if (!leave) {
      // Check if admin/HR trying to delete
      if (req.session.userRole === 'admin' || req.session.userRole === 'hr') {
        const adminLeave = await Leave.findByIdAndDelete(req.params.id);
        if (!adminLeave) {
          return res.status(404).json({ message: 'Leave request not found' });
        }
        return res.json({ message: 'Leave request deleted successfully' });
      }
      return res.status(404).json({ message: 'Leave request not found or access denied' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
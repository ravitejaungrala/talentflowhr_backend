const express = require('express');
const Document = require('../models/Document');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Get documents
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('uploadedBy', 'name email department position');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload document
router.post('/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const document = new Document({
      ...req.body,
      uploadedBy: req.user.id
    });
    await document.save();
    await document.populate('uploadedBy', 'name email department position');
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

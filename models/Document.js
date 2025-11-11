const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  filename: String,
  url: String,
  size: Number,
  category: {
    type: String,
    enum: ['policy', 'handbook', 'form', 'template', 'report', 'other'],
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessibleTo: {
    type: String,
    enum: ['all', 'department', 'role', 'specific'],
    default: 'all'
  },
  departments: [String],
  roles: [String],
  specificEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isConfidential: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
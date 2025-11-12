const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  fromEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['positive', 'constructive', 'general'],
    default: 'general'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);

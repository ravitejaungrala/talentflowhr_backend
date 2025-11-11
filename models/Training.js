const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['technical', 'soft_skills', 'leadership', 'compliance', 'product_knowledge'],
    required: true
  },
  instructor: String,
  duration: Number, // in hours
  resources: [{
    name: String,
    url: String,
    type: String
  }],
  enrolledEmployees: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Training', trainingSchema);
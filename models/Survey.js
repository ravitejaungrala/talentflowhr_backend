const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['multiple_choice', 'rating', 'text'],
      required: true
    },
    options: [String],
    required: Boolean
  }],
  targetAudience: {
    type: String,
    enum: ['all', 'department', 'role'],
    default: 'all'
  },
  department: String,
  role: String,
  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  responses: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [mongoose.Schema.Types.Mixed],
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Survey', surveySchema);
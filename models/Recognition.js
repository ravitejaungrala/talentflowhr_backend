const mongoose = require('mongoose');

const recognitionSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['excellence', 'teamwork', 'innovation', 'leadership', 'customer_focus'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 10
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Recognition', recognitionSchema);
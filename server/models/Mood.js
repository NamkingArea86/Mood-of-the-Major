const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodType: {
    type: String,
    required: true,
    enum: ['happy', 'stressed', 'tired', 'neutral', 'sad']
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280
  },
  faculty: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Mood', moodSchema);
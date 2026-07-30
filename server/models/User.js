const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  faculty: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    enum: ['tulip', 'cherry', 'rose', 'sunflower', 'daisy', 'white_flower', 'lotus', 'hyacinth'],
    default: 'sunflower'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
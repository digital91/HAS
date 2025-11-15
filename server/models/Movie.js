const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  genre: [{
    type: String,
    required: true
  }],
  duration: {
    type: Number,
    required: true // in minutes
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  director: {
    type: String,
    required: true
  },
  cast: [{
    type: String
  }],
  releaseDate: {
    type: Date,
    required: true
  },
  poster: {
    type: String,
    required: true
  },
  trailer: {
    type: String
  },
  status: {
    type: String,
    enum: ['coming-soon', 'now-showing', 'ended'],
    default: 'coming-soon'
  },
  price: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
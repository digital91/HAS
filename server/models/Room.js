const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 50
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  currentMovie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    default: null
  },
  currentShowtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  features: [{
    type: String,
    enum: ['3D', 'IMAX', 'Dolby', 'VIP']
  }],
  thumbnail: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);

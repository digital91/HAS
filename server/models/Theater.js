const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    }
  },
  capacity: {
    type: Number,
    required: true
  },
  screenType: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX'],
    default: '2D'
  },
  amenities: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Theater', theaterSchema);

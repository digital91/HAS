const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  showtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  row: {
    type: String,
    required: true
  },
  column: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'selected', 'booked', 'maintenance'],
    default: 'available'
  },
  seatType: {
    type: String,
    enum: ['standard', 'vip', 'couple'],
    default: 'standard'
  },
  price: {
    type: Number,
    required: true
  },
  selectedBy: {
    type: String, // socket.id of user who selected
    default: null
  },
  selectedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
seatSchema.index({ showtime: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);

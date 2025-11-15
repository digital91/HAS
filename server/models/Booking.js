const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  showtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },
  seats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  bookingCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Generate booking code before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingCode) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingCode = `BK${timestamp}${random}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
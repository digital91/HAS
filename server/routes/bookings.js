const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Showtime = require('../models/Showtime');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');

// Create new booking (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customer, showtimeId, seatIds, paymentMethod } = req.body;
    
    // Validate required fields
    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'Showtime ID and seat IDs are required' });
    }
    
    // Use authenticated user's email if customer email not provided
    const customerEmail = customer?.email || req.user.email;
    const customerName = customer?.name || req.user.name;
    const customerPhone = customer?.phone || req.user.phone || '';
    
    // Validate showtime exists
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    // Check if seats are available
    const seats = await Seat.find({ 
      _id: { $in: seatIds },
      showtime: showtimeId 
    });
    
    if (seats.length !== seatIds.length) {
      return res.status(400).json({ message: 'Some seats not found' });
    }
    
    const unavailableSeats = seats.filter(seat => seat.status !== 'available');
    if (unavailableSeats.length > 0) {
      return res.status(400).json({ 
        message: 'Some seats are no longer available',
        unavailableSeats: unavailableSeats.map(s => s.seatNumber)
      });
    }
    
    // Calculate total amount
    const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
    
    // Create booking
    const booking = new Booking({
      customer: {
        email: customerEmail,
        name: customerName,
        phone: customerPhone
      },
      user: req.user._id, // Link booking to authenticated user
      showtime: showtimeId,
      seats: seatIds,
      totalPrice,
      paymentMethod: paymentMethod || 'cash'
    });
    
    await booking.save();
    
    // Update seat status
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { status: 'booked' }
    );
    
    // Populate booking data for response
    await booking.populate([
      { path: 'showtime', populate: { path: 'movie', select: 'title poster' } },
      { path: 'seats', select: 'seatNumber row column seatType price' }
    ]);
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by code
router.get('/code/:bookingCode', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingCode: req.params.bookingCode })
      .populate([
        { path: 'showtime', populate: { path: 'movie', select: 'title poster' } },
        { path: 'seats', select: 'seatNumber row column seatType price' }
      ]);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings by customer email (requires authentication)
router.get('/customer/:email', authenticateToken, async (req, res) => {
  try {
    const email = req.params.email;
    
    // Chỉ cho phép xem booking của chính mình hoặc admin
    if (req.user.email !== email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only view your own bookings.' });
    }
    
    const bookings = await Booking.find({ 'customer.email': email })
      .populate([
        { path: 'showtime', populate: { path: 'movie', select: 'title poster' } },
        { path: 'seats', select: 'seatNumber row column seatType price' }
      ])
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking (requires authentication)
router.patch('/:bookingId/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Chỉ cho phép cancel booking của chính mình hoặc admin
    if (booking.customer.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only cancel your own bookings.' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // Release seats
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      { status: 'available', selectedBy: null, selectedAt: null }
    );
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm booking (after payment) - Admin only
router.patch('/:bookingId/confirm', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking cannot be confirmed' });
    }
    
    booking.status = 'confirmed';
    await booking.save();
    
    res.json({ message: 'Booking confirmed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

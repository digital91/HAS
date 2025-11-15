const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Showtime = require('../models/Showtime');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get seats for a showtime
router.get('/showtime/:showtimeId', async (req, res) => {
  try {
    const seats = await Seat.find({ showtime: req.params.showtimeId })
      .sort({ row: 1, column: 1 });
    
    // Group seats by row for easier frontend handling
    const seatsByRow = {};
    seats.forEach(seat => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = [];
      }
      seatsByRow[seat.row].push(seat);
    });
    
    res.json(seatsByRow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update seat status (for real-time updates)
router.patch('/:seatId/status', async (req, res) => {
  try {
    const { status, selectedBy } = req.body;
    const seat = await Seat.findByIdAndUpdate(
      req.params.seatId,
      { 
        status,
        selectedBy: status === 'selected' ? selectedBy : null,
        selectedAt: status === 'selected' ? new Date() : null
      },
      { new: true }
    );
    
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }
    
    res.json(seat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create seats for a showtime (admin only)
router.post('/showtime/:showtimeId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    const { rows, seatsPerRow, seatTypes } = req.body;
    const seats = [];
    
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= seatsPerRow; col++) {
        const seatType = seatTypes[row] || 'standard';
        const price = seatType === 'vip' ? showtime.price * 1.5 : 
                     seatType === 'couple' ? showtime.price * 2 : showtime.price;
        
        seats.push({
          showtime: req.params.showtimeId,
          seatNumber: `${String.fromCharCode(64 + row)}${col}`,
          row: String.fromCharCode(64 + row),
          column: col,
          seatType,
          price
        });
      }
    }
    
    await Seat.insertMany(seats);
    res.status(201).json({ message: 'Seats created successfully', count: seats.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear expired seat selections
router.delete('/clear-expired', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const expiredTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const result = await Seat.updateMany(
      { 
        status: 'selected', 
        selectedAt: { $lt: expiredTime } 
      },
      { 
        status: 'available', 
        selectedBy: null, 
        selectedAt: null 
      }
    );
    
    res.json({ message: `Cleared ${result.modifiedCount} expired seat selections` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

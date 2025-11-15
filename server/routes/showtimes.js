const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all showtimes
router.get('/', async (req, res) => {
  try {
    const { movieId, roomId, date, status } = req.query;
    let query = {};
    
    if (movieId) query.movie = movieId;
    if (roomId) query.room = roomId;
    if (status) query.status = status;
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const showtimes = await Showtime.find(query)
      .populate('movie', 'title duration poster rating')
      .populate('room', 'name capacity features')
      .sort({ date: 1, time: 1 });
    
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get showtime by ID
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title duration poster rating genre')
      .populate('room', 'name capacity features');
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new showtime (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { movie, room, date, time, price } = req.body;
    
    // Validate movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Validate room exists
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check for conflicts
    const conflictingShowtime = await Showtime.findOne({
      room,
      date: new Date(date),
      time,
      status: { $in: ['scheduled', 'ongoing'] }
    });
    
    if (conflictingShowtime) {
      return res.status(400).json({ 
        message: 'Time slot conflict with existing showtime' 
      });
    }
    
    const showtime = new Showtime({
      movie,
      room,
      date: new Date(date),
      time,
      price,
      availableSeats: roomExists.capacity,
      totalSeats: roomExists.capacity
    });
    
    await showtime.save();
    
    // Populate the response
    await showtime.populate([
      { path: 'movie', select: 'title duration poster rating' },
      { path: 'room', select: 'name capacity features' }
    ]);
    
    res.status(201).json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update showtime (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'movie', select: 'title duration poster rating' },
      { path: 'room', select: 'name capacity features' }
    ]);
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete showtime (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    res.json({ message: 'Showtime cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

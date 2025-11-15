const express = require('express');
const router = express.Router();
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all theaters
router.get('/', async (req, res) => {
  try {
    const theaters = await Theater.find({ isActive: true });
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get theater by ID
router.get('/:id', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }
    res.json(theater);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get showtimes for a theater
router.get('/:id/showtimes', async (req, res) => {
  try {
    const { date, movieId } = req.query;
    let query = { room: req.params.id, status: { $in: ['scheduled', 'ongoing'] } };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (movieId) query.movie = movieId;
    
    const showtimes = await Showtime.find(query)
      .populate('movie', 'title duration poster')
      .sort({ time: 1 });
    
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new theater (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const theater = new Theater(req.body);
    await theater.save();
    res.status(201).json(theater);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

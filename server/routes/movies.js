const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all movies
router.get('/', async (req, res) => {
  try {
    const { status, genre } = req.query;
    let query = { isActive: true };
    
    if (status) query.status = status;
    if (genre) query.genre = { $in: [genre] };
    
    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new movie (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update movie (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Movie update request:', req.params.id, req.body);
    
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!movie) {
      console.log('Movie not found:', req.params.id);
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    console.log('Movie updated successfully:', movie.title);
    res.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete movie (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get io instance for real-time updates
let io;
const setIO = (socketIO) => {
  io = socketIO;
};

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) query.status = status;
    
    const rooms = await Room.find(query)
      .populate('currentMovie', 'title poster')
      .populate('currentShowtime', 'date time')
      .sort({ name: 1 });
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('currentMovie', 'title poster')
      .populate('currentShowtime', 'date time');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get room status with real-time seat information
router.get('/:id/status', async (req, res) => {
  try {
    const { showtimeId } = req.query;
    
    if (!showtimeId) {
      return res.status(400).json({ message: 'Showtime ID is required' });
    }
    
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Get seat counts for this showtime
    const Seat = require('../models/Seat');
    const mongoose = require('mongoose');
    const seatCounts = await Seat.aggregate([
      { $match: { showtime: new mongoose.Types.ObjectId(showtimeId) } },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 } 
      }}
    ]);
    
    const statusCounts = {
      available: 0,
      selected: 0,
      booked: 0,
      maintenance: 0
    };
    
    seatCounts.forEach(item => {
      statusCounts[item._id] = item.count;
    });
    
    res.json({
      room,
      seatCounts: statusCounts,
      totalSeats: Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new room (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update room (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Room update request:', req.params.id, req.body);
    
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      console.log('Room not found:', req.params.id);
      return res.status(404).json({ message: 'Room not found' });
    }
    
    console.log('Room updated successfully:', room.name);
    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete room (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update room status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['available', 'occupied', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        lastActivity: new Date()
      },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin endpoints for compatibility with demo server
router.put('/rooms/:roomId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Admin room status update request:', req.params.roomId, req.body);
    const { status } = req.body;
    
    if (!['available', 'occupied', 'maintenance'].includes(status)) {
      console.log('Invalid status:', status);
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    console.log('Updating room:', req.params.roomId, 'to status:', status);
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { 
        status,
        lastActivity: new Date()
      },
      { new: true }
    );
    
    if (!room) {
      console.log('Room not found:', req.params.roomId);
      return res.status(404).json({ message: 'Room not found' });
    }
    
    console.log('Room updated successfully:', room);
    
    // Emit real-time update
    if (io) {
      io.emit('room-status-update', {
        roomId: room._id.toString(),
        updates: {
          status: room.status,
          lastActivity: room.lastActivity
        }
      });
    }
    
    res.json({ message: 'Room status updated successfully', room });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/rooms/:roomId/movie', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { movieId } = req.body;
    
    // Find the movie
    const Movie = require('../models/Movie');
    const movie = await Movie.findById(movieId);
    
    if (!movie) {
      return res.status(400).json({ message: 'Invalid movie' });
    }
    
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { 
        currentMovie: movieId,
        status: 'occupied',
        lastActivity: new Date()
      },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room movie updated successfully', room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User room booking endpoint
router.post('/:roomId/book', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (room.status !== 'available') {
      return res.status(400).json({ message: 'Room is not available' });
    }
    
    // Update room status to occupied
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.roomId,
      { 
        status: 'occupied',
        lastActivity: new Date()
      },
      { new: true }
    );
    
    // Emit real-time update
    if (io) {
      io.emit('room-status-update', {
        roomId: updatedRoom._id.toString(),
        updates: {
          status: updatedRoom.status,
          lastActivity: updatedRoom.lastActivity
        }
      });
    }
    
    res.json({ 
      message: 'Room booked successfully', 
      room: updatedRoom,
      bookingCode: `BOOK_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, setIO };

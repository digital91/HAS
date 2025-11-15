const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDB = require('./config/database');
const Seat = require('./models/Seat');
const Room = require('./models/Room');
const { sanitizeInput } = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config({ path: './config.env' });

const app = express();
const server = http.createServer(app);

// Trust proxy for rate limiting
app.set('trust proxy', 1);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io authentication middleware
const jwt = require('jsonwebtoken');
const User = require('./models/User');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Allow connection but mark as unauthenticated for public features
      socket.userId = null;
      socket.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      socket.userId = null;
      socket.user = null;
      return next();
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    // Allow connection but mark as unauthenticated
    socket.userId = null;
    socket.user = null;
    next();
  }
});

// Rate limiting - Production ready limits
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // 100 for production, 500 for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // 5 for production, 20 for development
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Request size limits to prevent DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(sanitizeInput); // Sanitize all input
app.use(express.static('public'));

// Apply rate limiting
app.use('/api', generalLimiter);

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/theaters', require('./routes/theaters'));

// Setup rooms routes with Socket.io
const roomsModule = require('./routes/rooms');
app.use('/api/rooms', roomsModule.router);
app.use('/api/admin', roomsModule.router);

app.use('/api/showtimes', require('./routes/showtimes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/seats', require('./routes/seats'));
app.use('/api/upload', require('./routes/upload'));

// Error handling middleware (must be last)
app.use(errorHandler);

// Helper function to update room status based on seat availability
const updateRoomStatus = async (showtimeId, theaterId) => {
  try {
    if (!showtimeId) return;
    
    // Get showtime to find the room
    const Showtime = require('./models/Showtime');
    const showtime = await Showtime.findById(showtimeId).populate('room');
    
    if (!showtime || !showtime.room) return;
    
    // Count available seats for this showtime
    const availableSeats = await Seat.countDocuments({
      showtime: showtimeId,
      status: 'available'
    });
    
    const selectedSeats = await Seat.countDocuments({
      showtime: showtimeId,
      status: 'selected'
    });
    
    const bookedSeats = await Seat.countDocuments({
      showtime: showtimeId,
      status: 'booked'
    });
    
    // Update showtime with current seat counts
    await Showtime.findByIdAndUpdate(showtimeId, {
      availableSeats: availableSeats,
      totalSeats: availableSeats + selectedSeats + bookedSeats
    });
    
    // Update room status based on occupancy
    let roomStatus = 'available';
    if (selectedSeats > 0 || bookedSeats > 0) {
      roomStatus = 'occupied';
    }
    
    await Room.findByIdAndUpdate(showtime.room._id, {
      status: roomStatus,
      lastActivity: new Date()
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Room ${showtime.room.name} status updated to: ${roomStatus}`);
    }
  } catch (error) {
    console.error('Error updating room status:', error);
  }
};

// Set up Socket.io for rooms routes
roomsModule.setIO(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('User connected:', socket.id, socket.userId ? `(authenticated: ${socket.user?.email})` : '(unauthenticated)');
  }

  // Send current rooms status to new connection (public feature)
  socket.on('get-rooms-status', async () => {
    try {
      const Room = require('./models/Room');
      const rooms = await Room.find({});
      socket.emit('rooms-status', rooms);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching rooms status:', error);
      }
      socket.emit('error', { message: 'Failed to fetch rooms status' });
    }
  });

  // Join theater room (public feature)
  socket.on('join-theater', (theaterId) => {
    // Validate theaterId to prevent injection
    if (!theaterId || typeof theaterId !== 'string') {
      return socket.emit('error', { message: 'Invalid theater ID' });
    }
    socket.join(`theater-${theaterId}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`User ${socket.id} joined theater ${theaterId}`);
    }
  });

  // Handle seat selection (requires authentication)
  socket.on('seat-selected', async (data) => {
    try {
      // Require authentication for seat selection
      if (!socket.userId) {
        return socket.emit('error', { message: 'Authentication required' });
      }

      const { seatId, theaterId } = data;
      
      // Validate input
      if (!seatId || !theaterId) {
        return socket.emit('error', { message: 'Seat ID and theater ID are required' });
      }
      
      // Update seat status in database
      const seat = await Seat.findByIdAndUpdate(
        seatId,
        {
          status: 'selected',
          selectedBy: socket.userId, // Use userId instead of socket.id
          selectedAt: new Date()
        },
        { new: true }
      );

      if (seat) {
        // Emit to other users in the same theater
        socket.to(`theater-${theaterId}`).emit('seat-update', {
          seatId: seatId,
          status: 'selected',
          userId: socket.userId,
          selectedAt: seat.selectedAt
        });

        // Update room status if needed
        await updateRoomStatus(seat.showtime, theaterId);
      } else {
        socket.emit('error', { message: 'Seat not found' });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error selecting seat:', error);
      }
      socket.emit('error', { message: 'Failed to select seat' });
    }
  });

  // Handle seat deselection (requires authentication)
  socket.on('seat-deselected', async (data) => {
    try {
      // Require authentication for seat deselection
      if (!socket.userId) {
        return socket.emit('error', { message: 'Authentication required' });
      }

      const { seatId, theaterId } = data;
      
      // Validate input
      if (!seatId || !theaterId) {
        return socket.emit('error', { message: 'Seat ID and theater ID are required' });
      }
      
      // Only allow user to deselect their own seats
      const seat = await Seat.findOne({ _id: seatId, selectedBy: socket.userId });
      if (!seat) {
        return socket.emit('error', { message: 'Seat not found or not selected by you' });
      }
      
      // Update seat status in database
      await Seat.findByIdAndUpdate(
        seatId,
        {
          status: 'available',
          selectedBy: null,
          selectedAt: null
        }
      );

      // Emit to other users in the same theater
      socket.to(`theater-${theaterId}`).emit('seat-update', {
        seatId: seatId,
        status: 'available',
        userId: null
      });

      // Update room status if needed
      await updateRoomStatus(seat.showtime, theaterId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deselecting seat:', error);
      }
      socket.emit('error', { message: 'Failed to deselect seat' });
    }
  });

  // Handle booking confirmation (requires authentication)
  socket.on('booking-confirmed', async (data) => {
    try {
      // Require authentication for booking confirmation
      if (!socket.userId) {
        return socket.emit('error', { message: 'Authentication required' });
      }

      const { seats, theaterId, showtimeId } = data;
      
      // Validate input
      if (!seats || !Array.isArray(seats) || seats.length === 0 || !showtimeId) {
        return socket.emit('error', { message: 'Invalid booking data' });
      }
      
      // Verify seats belong to this user
      const userSeats = await Seat.find({ 
        _id: { $in: seats },
        selectedBy: socket.userId 
      });
      
      if (userSeats.length !== seats.length) {
        return socket.emit('error', { message: 'Some seats are not selected by you' });
      }
      
      // Update all booked seats in database
      await Seat.updateMany(
        { _id: { $in: seats } },
        {
          status: 'booked',
          selectedBy: null,
          selectedAt: null
        }
      );

      // Emit to other users in the same theater
      socket.to(`theater-${theaterId}`).emit('booking-update', {
        seats: seats,
        status: 'booked'
      });

      // Update room status
      await updateRoomStatus(showtimeId, theaterId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error confirming booking:', error);
      }
      socket.emit('error', { message: 'Failed to confirm booking' });
    }
  });

  socket.on('disconnect', async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('User disconnected:', socket.id);
    }
    
    // Clear all seats selected by this user
    if (socket.userId) {
      try {
        await Seat.updateMany(
          { selectedBy: socket.userId },
          {
            status: 'available',
            selectedBy: null,
            selectedAt: null
          }
        );
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error clearing seats on disconnect:', error);
        }
      }
    }
  });
});

// Connect to MongoDB
connectDB();

// Scheduled job to clear expired seat selections (every 5 minutes)
setInterval(async () => {
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
    
    if (result.modifiedCount > 0 && process.env.NODE_ENV === 'development') {
      console.log(`Cleared ${result.modifiedCount} expired seat selections`);
    }
  } catch (error) {
    console.error('Error clearing expired seats:', error);
  }
}, 5 * 60 * 1000); // Run every 5 minutes

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };

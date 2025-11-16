import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    try {
      // In production, always connect via the same origin (through Nginx)
      // Fall back to localhost only for local development
      const isProd = typeof window !== 'undefined' && window.location.protocol.startsWith('https');
      const baseUrl = isProd ? '/' : (process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');

      const newSocket = io(baseUrl, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        withCredentials: true
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      newSocket.on('seat-update', (data) => {
        console.log('Seat update received:', data);
        // This will be handled by components that listen to this event
      });

      newSocket.on('booking-update', (data) => {
        console.log('Booking update received:', data);
        // This will be handled by components that listen to this event
      });

      setSocket(newSocket);

      return () => {
        try {
          newSocket.close();
        } catch (error) {
          console.error('Error closing socket:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }, []);

  const joinTheater = (theaterId) => {
    try {
      if (socket) {
        socket.emit('join-theater', theaterId);
      }
    } catch (error) {
      console.error('Error joining theater:', error);
    }
  };

  const selectSeat = (theaterId, seatId) => {
    try {
      if (socket) {
        socket.emit('seat-selected', { theaterId, seatId });
      }
    } catch (error) {
      console.error('Error selecting seat:', error);
    }
  };

  const deselectSeat = (theaterId, seatId) => {
    try {
      if (socket) {
        socket.emit('seat-deselected', { theaterId, seatId });
      }
    } catch (error) {
      console.error('Error deselecting seat:', error);
    }
  };

  const confirmBooking = (theaterId, seats, showtimeId) => {
    try {
      if (socket) {
        socket.emit('booking-confirmed', { theaterId, seats, showtimeId });
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  // Room management functions
  const bookRoom = (roomId, movieId, showtimeId, userId) => {
    try {
      if (socket) {
        socket.emit('book-room', { roomId, movieId, showtimeId, userId });
      }
    } catch (error) {
      console.error('Error booking room:', error);
    }
  };

  const value = {
    socket,
    isConnected,
    joinTheater,
    selectSeat,
    deselectSeat,
    confirmBooking,
    bookRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

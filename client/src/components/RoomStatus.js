import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import './RoomStatus.css';

const RoomStatus = ({ roomId, showtimeId, onSeatUpdate, onBookingUpdate }) => {
  const [roomStatus, setRoomStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, isConnected } = useSocket();

  // Fetch room status from API
  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rooms/${roomId}/status?showtimeId=${showtimeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch room status');
      }
      const data = await response.json();
      setRoomStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching room status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (roomId && showtimeId) {
      fetchRoomStatus();
    }
  }, [roomId, showtimeId]);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    const handleSeatUpdate = (data) => {
      console.log('RoomStatus received seat update:', data);
      if (onSeatUpdate) {
        onSeatUpdate(data);
      }
      
      // Update local state
      setRoomStatus(prev => {
        if (!prev) return prev;
        
        const newSeatCounts = { ...prev.seatCounts };
        // This is a simplified update - in real app you'd need more sophisticated logic
        if (data.status === 'selected') {
          newSeatCounts.available = Math.max(0, newSeatCounts.available - 1);
          newSeatCounts.selected = newSeatCounts.selected + 1;
        } else if (data.status === 'available') {
          newSeatCounts.selected = Math.max(0, newSeatCounts.selected - 1);
          newSeatCounts.available = newSeatCounts.available + 1;
        }
        
        return {
          ...prev,
          seatCounts: newSeatCounts
        };
      });
    };

    const handleBookingUpdate = (data) => {
      console.log('RoomStatus received booking update:', data);
      if (onBookingUpdate) {
        onBookingUpdate(data);
      }
      
      // Refresh room status after booking
      fetchRoomStatus();
    };

    socket.on('seat-update', handleSeatUpdate);
    socket.on('booking-update', handleBookingUpdate);

    return () => {
      socket.off('seat-update', handleSeatUpdate);
      socket.off('booking-update', handleBookingUpdate);
    };
  }, [socket, onSeatUpdate, onBookingUpdate]);

  if (loading) {
    return (
      <div className="room-status loading">
        <div className="loading-spinner"></div>
        <p>Loading room status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-status error">
        <p>Error: {error}</p>
        <button onClick={fetchRoomStatus}>Retry</button>
      </div>
    );
  }

  if (!roomStatus) {
    return (
      <div className="room-status">
        <p>No room status available</p>
      </div>
    );
  }

  const { room, seatCounts, totalSeats } = roomStatus;
  const occupancyRate = totalSeats > 0 ? ((seatCounts.selected + seatCounts.booked) / totalSeats * 100).toFixed(1) : 0;

  return (
    <div className="room-status">
      <div className="room-header">
        <h3>{room.name}</h3>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      <div className="room-info">
        <div className="room-details">
          <p><strong>Status:</strong> 
            <span className={`status-badge ${room.status}`}>
              {room.status}
            </span>
          </p>
          <p><strong>Last Activity:</strong> {new Date(room.lastActivity).toLocaleString()}</p>
        </div>
        
        <div className="seat-summary">
          <h4>Seat Status</h4>
          <div className="seat-counts">
            <div className="seat-count available">
              <span className="count">{seatCounts.available}</span>
              <span className="label">Available</span>
            </div>
            <div className="seat-count selected">
              <span className="count">{seatCounts.selected}</span>
              <span className="label">Selected</span>
            </div>
            <div className="seat-count booked">
              <span className="count">{seatCounts.booked}</span>
              <span className="label">Booked</span>
            </div>
            <div className="seat-count maintenance">
              <span className="count">{seatCounts.maintenance}</span>
              <span className="label">Maintenance</span>
            </div>
          </div>
          
          <div className="occupancy-info">
            <p><strong>Total Seats:</strong> {totalSeats}</p>
            <p><strong>Occupancy Rate:</strong> {occupancyRate}%</p>
          </div>
        </div>
      </div>
      
      <div className="room-actions">
        <button onClick={fetchRoomStatus} className="refresh-btn">
          🔄 Refresh Status
        </button>
      </div>
    </div>
  );
};

export default RoomStatus;

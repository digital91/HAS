import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaTimes, FaUsers, FaChair } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';
import './SeatNotification.css';

const SeatNotification = ({ showtimeId, theaterId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [seatData, setSeatData] = useState({
    available: 0,
    selected: 0,
    booked: 0,
    total: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    // Show notification when component mounts
    setIsVisible(true);

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for seat updates
    const handleSeatUpdate = (data) => {
      setRecentActivity(prev => [
        {
          id: Date.now(),
          message: data.status === 'selected' 
            ? `Ghế ${data.seatId} đang được chọn`
            : `Ghế ${data.seatId} đã được giải phóng`,
          type: data.status === 'selected' ? 'select' : 'deselect',
          timestamp: new Date()
        },
        ...prev.slice(0, 4) // Keep only last 5 activities
      ]);

      // Update seat counts
      setSeatData(prev => ({
        ...prev,
        available: data.status === 'selected' ? prev.available - 1 : prev.available + 1,
        selected: data.status === 'selected' ? prev.selected + 1 : prev.selected - 1
      }));
    };

    const handleBookingUpdate = (data) => {
      setRecentActivity(prev => [
        {
          id: Date.now(),
          message: `${data.seats.length} ghế đã được đặt`,
          type: 'book',
          timestamp: new Date()
        },
        ...prev.slice(0, 4)
      ]);

      setSeatData(prev => ({
        ...prev,
        selected: prev.selected - data.seats.length,
        booked: prev.booked + data.seats.length,
        available: prev.available + data.seats.length
      }));
    };

    socket.on('seat-update', handleSeatUpdate);
    socket.on('booking-update', handleBookingUpdate);

    return () => {
      socket.off('seat-update', handleSeatUpdate);
      socket.off('booking-update', handleBookingUpdate);
    };
  }, [socket, isConnected]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'select':
        return <FaChair className="activity-icon select" />;
      case 'deselect':
        return <FaChair className="activity-icon deselect" />;
      case 'book':
        return <FaUsers className="activity-icon book" />;
      default:
        return <FaInfoCircle className="activity-icon" />;
    }
  };

  // const getActivityColor = (type) => {
  //   switch (type) {
  //     case 'select':
  //       return '#ffa500';
  //     case 'deselect':
  //       return '#4CAF50';
  //     case 'book':
  //       return '#e50914';
  //     default:
  //       return '#2196F3';
  //   }
  // };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="seat-notification"
        >
          <div className="notification-header">
            <div className="notification-title">
              <FaInfoCircle className="title-icon" />
              <span>Thông tin ghế ngồi</span>
            </div>
            <button className="close-btn" onClick={handleClose}>
              <FaTimes />
            </button>
          </div>

          <div className="notification-content">
            <div className="seat-stats">
              <div className="stat-item">
                <div className="stat-number available">{seatData.available}</div>
                <div className="stat-label">Còn trống</div>
              </div>
              <div className="stat-item">
                <div className="stat-number selected">{seatData.selected}</div>
                <div className="stat-label">Đang chọn</div>
              </div>
              <div className="stat-item">
                <div className="stat-number booked">{seatData.booked}</div>
                <div className="stat-label">Đã đặt</div>
              </div>
            </div>

            {recentActivity.length > 0 && (
              <div className="recent-activity">
                <h4>Hoạt động gần đây</h4>
                <div className="activity-list">
                  {recentActivity.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="activity-item"
                    >
                      {getActivityIcon(activity.type)}
                      <span className="activity-message">{activity.message}</span>
                      <span className="activity-time">
                        {activity.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="connection-status">
              <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
              <span>{isConnected ? 'Kết nối real-time' : 'Mất kết nối'}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeatNotification;

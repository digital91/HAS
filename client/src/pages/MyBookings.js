import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTicketAlt, FaSearch, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    if (customerEmail) {
      fetchBookings();
    }
  }, [customerEmail]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchEmail]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/bookings/customer/${customerEmail}`);
      setBookings(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách đặt phòng');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (!searchEmail) {
      setFilteredBookings(bookings);
      return;
    }

    const filtered = bookings.filter(booking =>
      booking.bookingCode.toLowerCase().includes(searchEmail.toLowerCase()) ||
      booking.showtime.movie.title.toLowerCase().includes(searchEmail.toLowerCase())
    );
    setFilteredBookings(filtered);
  };

  const handleSearch = () => {
    if (!searchEmail.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setCustomerEmail(searchEmail);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#ffa500';
      case 'cancelled':
        return '#f44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="my-bookings">
      <div className="container">
        <div className="page-header">
          <h1>Đặt phòng</h1>
          <p>Tra cứu và quản lý phòng đã đặt</p>
        </div>

        <div className="search-section">
          <div className="search-box">
            <input
              type="email"
              placeholder="Nhập email để tra cứu đặt phòng..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-primary">
              <FaSearch />
              Tra cứu
            </button>
          </div>
        </div>

        {customerEmail && (
          <div className="bookings-content">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Đang tải danh sách đặt phòng...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="no-bookings">
                <FaTicketAlt className="no-bookings-icon" />
                <h3>Không tìm thấy đặt phòng nào</h3>
                <p>Không có đặt phòng nào được tìm thấy cho email này</p>
              </div>
            ) : (
              <div className="bookings-grid">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="booking-card"
                  >
                    <div className="booking-header">
                      <div className="booking-code">
                        <FaTicketAlt className="code-icon" />
                        <span>{booking.bookingCode}</span>
                      </div>
                      <div 
                        className="booking-status"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {getStatusText(booking.status)}
                      </div>
                    </div>

                    <div className="movie-info">
                      <img src={booking.showtime.movie.poster} alt={booking.showtime.movie.title} />
                      <div className="info">
                        <h3>{booking.showtime.movie.title}</h3>
                        <div className="showtime-details">
                          <div className="detail-item">
                            <FaMapMarkerAlt className="detail-icon" />
                            <span>{booking.showtime.theater.name}</span>
                          </div>
                          <div className="detail-item">
                            <FaCalendarAlt className="detail-icon" />
                            <span>{new Date(booking.showtime.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="detail-item">
                            <FaClock className="detail-icon" />
                            <span>{booking.showtime.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="seats-info">
                      <h4>Ghế đã đặt:</h4>
                      <div className="seats-list">
                        {booking.seats.map(seat => (
                          <span key={seat._id} className="seat-tag">
                            {seat.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="booking-footer">
                      <div className="total-amount">
                        <span>Tổng tiền:</span>
                        <span className="amount">{formatPrice(booking.totalAmount)}</span>
                      </div>
                      <div className="booking-date">
                        Đặt ngày: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {!customerEmail && (
          <div className="search-prompt">
            <FaTicketAlt className="prompt-icon" />
            <h3>Tra cứu đặt phòng</h3>
            <p>Nhập email để xem tất cả đặt phòng đã tạo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

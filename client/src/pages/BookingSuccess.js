import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTicketAlt, FaDownload, FaHome, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import './BookingSuccess.css';

const BookingSuccess = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingCode]);

  const fetchBookingDetails = async () => {
    try {
      const response = await axios.get(`/api/bookings/code/${bookingCode}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    alert('Tính năng tải thông tin đặt phòng sẽ được phát triển trong phiên bản tiếp theo');
  };

  const handleSendEmail = () => {
    // In a real app, this would send ticket via email
    alert('Thông tin đặt phòng đã được gửi qua email');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Đang tải thông tin đặt phòng...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="error">
        <h2>Không tìm thấy thông tin đặt phòng</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="booking-success">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="success-content"
        >
          <div className="success-header">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="success-icon"
            >
              <FaCheckCircle />
            </motion.div>
            <h1>Đặt phòng thành công!</h1>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
          </div>

          <div className="booking-details">
            <div className="detail-card">
              <h3>Thông tin đặt phòng</h3>
              <div className="detail-item">
                <span className="label">Mã đặt phòng:</span>
                <span className="value booking-code">{booking.bookingCode}</span>
              </div>
              <div className="detail-item">
                <span className="label">Trạng thái:</span>
                <span className={`value status ${booking.status}`}>
                  {booking.status === 'confirmed' ? 'Đã xác nhận' : 
                   booking.status === 'pending' ? 'Chờ xác nhận' : 
                   booking.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Tổng tiền:</span>
                <span className="value price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}
                </span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Thông tin phim</h3>
              <div className="movie-info">
                <img src={booking.showtime.movie.poster} alt={booking.showtime.movie.title} />
                <div className="info">
                  <h4>{booking.showtime.movie.title}</h4>
                  <p><strong>Rạp:</strong> {booking.showtime.theater.name}</p>
                  <p><strong>Ngày:</strong> {new Date(booking.showtime.date).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Giờ:</strong> {booking.showtime.time}</p>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>Ghế đã đặt</h3>
              <div className="seats-info">
                {booking.seats.map(seat => (
                  <div key={seat._id} className="seat-item">
                    <span className="seat-number">{seat.seatNumber}</span>
                    <span className="seat-type">{seat.seatType.toUpperCase()}</span>
                    <span className="seat-price">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(seat.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-card">
              <h3>Thông tin khách hàng</h3>
              <div className="detail-item">
                <span className="label">Họ tên:</span>
                <span className="value">{booking.customer.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{booking.customer.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{booking.customer.phone}</span>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button onClick={handleDownloadTicket} className="btn btn-primary">
              <FaDownload className="btn-icon" />
              Tải vé
            </button>
            <button onClick={handleSendEmail} className="btn btn-outline">
              <FaEnvelope className="btn-icon" />
              Gửi email
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              <FaHome className="btn-icon" />
              Về trang chủ
            </button>
          </div>

          <div className="success-note">
            <p>
              <strong>Lưu ý:</strong> Vui lòng đến rạp trước giờ chiếu 15 phút để nhận vé. 
              Mang theo mã đặt vé hoặc CMND/CCCD để xác nhận.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingSuccess;

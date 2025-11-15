import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChair, FaArrowLeft, FaCreditCard, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import SeatNotification from '../components/SeatNotification';
import BookingPromoPopup from '../components/BookingPromoPopup';
import './Booking.css';

const Booking = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { socket, joinTheater, selectSeat, deselectSeat, confirmBooking } = useSocket();
  
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select seats, 2: Customer info, 3: Payment
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    fetchShowtimeData();
    
    // Join theater room for real-time updates
    if (socket) {
      joinTheater(showtimeId);
    }

    return () => {
      // Clean up selected seats when leaving
      selectedSeats.forEach(seatId => {
        deselectSeat(showtimeId, seatId);
      });
    };
  }, [socket, showtimeId, selectedSeats, deselectSeat, joinTheater, fetchShowtimeData]);

  useEffect(() => {
    if (!socket) return;

    const handleSeatUpdate = (data) => {
      setSeats(prevSeats => {
        const newSeats = { ...prevSeats };
        Object.keys(newSeats).forEach(row => {
          newSeats[row] = newSeats[row].map(seat => {
            if (seat._id === data.seatId) {
              return {
                ...seat,
                status: data.status,
                selectedBy: data.userId
              };
            }
            return seat;
          });
        });
        return newSeats;
      });
    };

    const handleBookingUpdate = (data) => {
      setSeats(prevSeats => {
        const newSeats = { ...prevSeats };
        Object.keys(newSeats).forEach(row => {
          newSeats[row] = newSeats[row].map(seat => {
            if (data.seats.includes(seat._id)) {
              return { ...seat, status: 'booked' };
            }
            return seat;
          });
        });
        return newSeats;
      });
    };

    socket.on('seat-update', handleSeatUpdate);
    socket.on('booking-update', handleBookingUpdate);

    return () => {
      socket.off('seat-update', handleSeatUpdate);
      socket.off('booking-update', handleBookingUpdate);
    };
  }, [socket]);

  const fetchShowtimeData = async () => {
    try {
      setLoading(true);
      const [showtimeRes, seatsRes] = await Promise.all([
        axios.get(`/api/theaters/${showtimeId}/showtimes`),
        axios.get(`/api/seats/showtime/${showtimeId}`)
      ]);
      
      setShowtime(showtimeRes.data[0]);
      setSeats(seatsRes.data);
    } catch (error) {
      toast.error('Không thể tải thông tin suất chiếu');
      console.error('Error fetching showtime data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked' || seat.status === 'maintenance') {
      return;
    }

    if (seat.status === 'selected' && seat.selectedBy === socket?.id) {
      // Deselect seat
      setSelectedSeats(prev => prev.filter(id => id !== seat._id));
      deselectSeat(showtimeId, seat._id);
    } else if (seat.status === 'available') {
      // Select seat
      setSelectedSeats(prev => [...prev, seat._id]);
      selectSeat(showtimeId, seat._id);
    }
  };

  const getSeatClass = (seat) => {
    let className = 'seat';
    
    if (seat.status === 'booked') className += ' booked';
    else if (seat.status === 'selected') {
      className += seat.selectedBy === socket?.id ? ' selected' : ' selecting';
    }
    else if (seat.status === 'maintenance') className += ' maintenance';
    else className += ' available';
    
    if (seat.seatType === 'vip') className += ' vip';
    else if (seat.seatType === 'couple') className += ' couple';
    
    return className;
  };

  const calculateTotal = () => {
    if (!seats || selectedSeats.length === 0) return 0;
    
    let total = 0;
    Object.values(seats).flat().forEach(seat => {
      if (selectedSeats.includes(seat._id)) {
        total += seat.price;
      }
    });

    // Apply promo discount
    if (appliedPromo) {
      const discountPercent = parseInt(appliedPromo.discount);
      total = total * (1 - discountPercent / 100);
    }
    
    return total;
  };

  const handleApplyPromo = (promo) => {
    setAppliedPromo(promo);
    toast.success(`Đã áp dụng ưu đãi: ${promo.title} -${promo.discount}`);
  };

  const handleClosePromo = () => {
    // Close promo popup without applying
  };

  const handleNextStep = () => {
    if (bookingStep === 1 && selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }
    
    if (bookingStep === 2) {
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
    }
    
    setBookingStep(prev => prev + 1);
  };

  const handleBooking = async () => {
    try {
      const bookingData = {
        customer: customerInfo,
        showtimeId,
        seatIds: selectedSeats,
        paymentMethod
      };

      const response = await axios.post('/api/bookings', bookingData);
      
      // Confirm booking via socket
      confirmBooking(showtimeId, selectedSeats);
      
      toast.success('Đặt phòng thành công!');
      navigate(`/booking-success/${response.data.bookingCode}`);
    } catch (error) {
      toast.error('Đặt phòng thất bại. Vui lòng thử lại.');
      console.error('Booking error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Đang tải...
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="error">
        <h2>Không tìm thấy suất chiếu</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <SeatNotification showtimeId={showtimeId} theaterId={showtime.theater._id} />
      <BookingPromoPopup 
        selectedSeats={selectedSeats}
        onClose={handleClosePromo}
        onApplyPromo={handleApplyPromo}
      />
      
      <div className="container">
        <div className="booking-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FaArrowLeft />
            Quay lại
          </button>
          <h1>Đặt phòng</h1>
        </div>

        <div className="booking-content">
          <div className="movie-info">
            <img src={showtime.movie.poster} alt={showtime.movie.title} />
            <div className="info-details">
              <h2>{showtime.movie.title}</h2>
              <p><strong>Rạp:</strong> {showtime.theater.name}</p>
              <p><strong>Ngày:</strong> {new Date(showtime.date).toLocaleDateString('vi-VN')}</p>
              <p><strong>Giờ:</strong> {showtime.time}</p>
              <p><strong>Ghế đã chọn:</strong> {selectedSeats.length}</p>
              {appliedPromo && (
                <p><strong>Ưu đãi:</strong> <span style={{color: '#4CAF50'}}>{appliedPromo.title} -{appliedPromo.discount}</span></p>
              )}
              <p><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}</p>
            </div>
          </div>

          <div className="booking-steps">
            {/* Step 1: Seat Selection */}
            {bookingStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="step-content"
              >
                <h3>Chọn ghế ngồi</h3>
                <div className="screen">Màn hình</div>
                <div className="seats-container">
                  {Object.entries(seats).map(([row, rowSeats]) => (
                    <div key={row} className="seat-row">
                      <div className="row-label">{row}</div>
                      <div className="seats">
                        {rowSeats.map(seat => (
                          <button
                            key={seat._id}
                            className={getSeatClass(seat)}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'booked' || seat.status === 'maintenance'}
                          >
                            <FaChair />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="seat available"><FaChair /></div>
                    <span>Còn trống</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat selected"><FaChair /></div>
                    <span>Đã chọn</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat selecting"><FaChair /></div>
                    <span>Đang chọn</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat booked"><FaChair /></div>
                    <span>Đã đặt</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat vip"><FaChair /></div>
                    <span>VIP</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Customer Information */}
            {bookingStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="step-content"
              >
                <h3>Thông tin khách hàng</h3>
                <div className="form-group">
                  <label>
                    <FaUser className="input-icon" />
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FaEnvelope className="input-icon" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Nhập email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FaPhone className="input-icon" />
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {bookingStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="step-content"
              >
                <h3>Phương thức thanh toán</h3>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-card">
                      <FaCreditCard />
                      <span>Thanh toán tại rạp</span>
                    </div>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-card">
                      <span>MoMo</span>
                    </div>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="zalopay"
                      checked={paymentMethod === 'zalopay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-card">
                      <span>ZaloPay</span>
                    </div>
                  </label>
                </div>
                <div className="booking-summary">
                  <h4>Tóm tắt đơn hàng</h4>
                  <div className="summary-item">
                    <span>Ghế đã chọn:</span>
                    <span>{selectedSeats.length} ghế</span>
                  </div>
                  <div className="summary-item">
                    <span>Tổng tiền:</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="booking-actions">
            {bookingStep > 1 && (
              <button 
                onClick={() => setBookingStep(prev => prev - 1)}
                className="btn btn-outline"
              >
                Quay lại
              </button>
            )}
            {bookingStep < 3 ? (
              <button onClick={handleNextStep} className="btn btn-primary">
                Tiếp tục
              </button>
            ) : (
              <button onClick={handleBooking} className="btn btn-primary">
                Xác nhận đặt phòng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

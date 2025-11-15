import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGift, FaPercent, FaTicketAlt, FaStar } from 'react-icons/fa';
import './BookingPromoPopup.css';

const BookingPromoPopup = ({ selectedSeats, onClose, onApplyPromo }) => {
  const [isVisible, setIsVisible] = useState(false);
  // const [selectedPromo, setSelectedPromo] = useState(null);

  useEffect(() => {
    // Show popup when user selects seats
    if (selectedSeats.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedSeats.length]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleApplyPromo = (promo) => {
    // setSelectedPromo(promo);
    onApplyPromo(promo);
    setIsVisible(false);
  };

  const promos = [
    {
      id: 'first-time',
      icon: <FaGift />,
      title: 'Khách hàng mới',
      discount: '20%',
      description: 'Giảm 20% cho đơn hàng đầu tiên',
      condition: 'Áp dụng cho khách hàng mới',
      color: '#4CAF50'
    },
    {
      id: 'combo',
      icon: <FaTicketAlt />,
      title: 'Combo VIP',
      discount: '15%',
      description: 'Bắp + Nước với giá ưu đãi',
      condition: 'Áp dụng khi đặt phòng từ 2 ghế',
      color: '#e50914'
    },
    {
      id: 'weekday',
      icon: <FaPercent />,
      title: 'Ngày thường',
      discount: '10%',
      description: 'Giảm giá cho suất chiếu ngày thường',
      condition: 'Thứ 2-4, suất sáng',
      color: '#FF9800'
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && selectedSeats.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="booking-promo-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="booking-promo-popup"
          >
            <div className="popup-header">
              <div className="popup-title">
                <FaGift className="title-icon" />
                <h2>🎉 Ưu đãi đặc biệt!</h2>
              </div>
              <button className="close-btn" onClick={handleClose}>
                <FaTimes />
              </button>
            </div>

            <div className="popup-content">
              <div className="selection-info">
                <p>Bạn đã chọn <strong>{selectedSeats.length} ghế</strong> - Hãy chọn ưu đãi phù hợp!</p>
              </div>

              <div className="promos-list">
                {promos.map((promo, index) => (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="promo-item"
                    onClick={() => handleApplyPromo(promo)}
                  >
                    <div className="promo-icon" style={{ backgroundColor: promo.color }}>
                      {promo.icon}
                    </div>
                    <div className="promo-content">
                      <div className="promo-header">
                        <h4>{promo.title}</h4>
                        <span className="discount-badge" style={{ backgroundColor: promo.color }}>
                          -{promo.discount}
                        </span>
                      </div>
                      <p className="promo-description">{promo.description}</p>
                      <p className="promo-condition">{promo.condition}</p>
                    </div>
                    <div className="promo-arrow">
                      <FaStar />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="popup-actions">
                <button 
                  onClick={handleClose}
                  className="btn btn-outline"
                >
                  Không áp dụng
                </button>
              </div>

              <div className="promo-note">
                <p>💡 <strong>Mẹo:</strong> Bạn có thể thay đổi ưu đãi bất kỳ lúc nào trước khi thanh toán</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingPromoPopup;

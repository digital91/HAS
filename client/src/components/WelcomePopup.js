import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTicketAlt, FaGift, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './WelcomePopup.css';

const WelcomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      // Check if popup is disabled
      const isDisabled = localStorage.getItem('disableWelcomePopup') || sessionStorage.getItem('disableWelcomePopup');
      if (isDisabled) {
        console.log('WelcomePopup - disabled by emergency fix');
        return;
      }
      
      // Always show popup on page load
      console.log('WelcomePopup - showing on every page load');
      setIsVisible(true);
    } catch (error) {
      console.error('Error in WelcomePopup useEffect:', error);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleBookNow = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="welcome-overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="welcome-popup"
          >
            <div className="welcome-header">
              <div className="welcome-icon">
                <FaTicketAlt />
              </div>
              <button className="close-btn" onClick={handleClose}>
                <FaTimes />
              </button>
            </div>

            <div className="welcome-content">
              <h2>🎬 Chào mừng đến với HAS Cinema!</h2>
              <p>Trải nghiệm phim ảnh tuyệt vời với công nghệ hiện đại và dịch vụ chuyên nghiệp</p>
              
              <div className="welcome-features">
                <div className="feature">
                  <FaGift className="feature-icon" />
                  <span>Ưu đãi đặc biệt cho khách hàng mới</span>
                </div>
                <div className="feature">
                  <FaStar className="feature-icon" />
                  <span>Ghế ngồi thoải mái và âm thanh chất lượng cao</span>
                </div>
                <div className="feature">
                <FaTicketAlt className="feature-icon" />
                <span>Đặt phòng nhanh chóng và tiện lợi</span>
                </div>
              </div>

              <div className="welcome-actions">
                <Link 
                  to="/movies" 
                  className="btn btn-primary"
                  onClick={handleBookNow}
                >
                  Khám phá phim
                </Link>
                <button 
                  onClick={handleClose}
                  className="btn btn-outline"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;

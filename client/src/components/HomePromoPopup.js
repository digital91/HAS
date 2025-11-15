import React, { useState, useEffect } from 'react';
import { FaTimes, FaTicketAlt, FaGift, FaStar, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './HomePromoPopup.css';

const HomePromoPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    try {
      // Check if popup is disabled
      const isDisabled = localStorage.getItem('disableHomePromoPopup') || sessionStorage.getItem('disableHomePromoPopup');
      if (isDisabled) {
        console.log('HomePromoPopup - disabled by emergency fix');
        return;
      }
      
      console.log('HomePromoPopup useEffect triggered');
      
      // Always show popup on page load
      console.log('HomePromoPopup - showing on every page load');
      setIsVisible(true);
    } catch (error) {
      console.error('Error in HomePromoPopup useEffect:', error);
    }
  }, []);

  const handleClose = () => {
    try {
      setIsVisible(false);
      // Remember that user has seen the popup in this session
      sessionStorage.setItem('hasSeenHomePromo', 'true');
    } catch (error) {
      console.error('Error in handleClose:', error);
    }
  };

  const handleBookNow = () => {
    try {
      setIsVisible(false);
      sessionStorage.setItem('hasSeenHomePromo', 'true');
    } catch (error) {
      console.error('Error in handleBookNow:', error);
    }
  };

  const promoOffers = [
    {
      icon: <FaGift />,
      title: "Giảm 20%",
      description: "Cho đơn hàng đầu tiên"
    },
    {
      icon: <FaStar />,
      title: "Combo VIP",
      description: "Bắp + Nước + Vé chỉ 150k"
    },
    {
      icon: <FaTicketAlt />,
      title: "Mua 2 tặng 1",
      description: "Áp dụng thứ 2-4"
    }
  ];

  console.log('HomePromoPopup render - isVisible:', isVisible);
  console.log('HomePromoPopup render - will render popup?', isVisible);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="home-promo-overlay">
      <div className="home-promo-popup">
            <div className="popup-header">
              <div className="popup-title">
                <FaTicketAlt className="title-icon" />
                <h2>Chào mừng đến với HAS Cinema!</h2>
              </div>
              <button className="close-btn" onClick={handleClose}>
                <FaTimes />
              </button>
            </div>

            <div className="popup-content">
              <div className="welcome-message">
                <h3>🎬 Trải nghiệm phim ảnh tuyệt vời</h3>
                <p>Đặt phòng ngay để nhận ưu đãi đặc biệt dành cho khách hàng mới!</p>
              </div>

              <div className="promo-offers">
                <h4>Ưu đãi hôm nay:</h4>
                <div className="offers-grid">
                  {promoOffers.map((offer, index) => (
                    <div
                      key={index}
                      className="offer-item"
                    >
                      <div className="offer-icon">{offer.icon}</div>
                      <div className="offer-content">
                        <h5>{offer.title}</h5>
                        <p>{offer.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="popup-actions">
                <Link 
                  to="/movies" 
                  className="btn btn-primary btn-large"
                  onClick={handleBookNow}
                >
                  <FaTicketAlt className="btn-icon" />
                  Đặt phòng ngay
                  <FaArrowRight className="btn-arrow" />
                </Link>
                <button 
                  onClick={handleClose}
                  className="btn btn-outline"
                >
                  Xem sau
                </button>
              </div>

              <div className="popup-features">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>Đặt phòng nhanh chóng</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Chọn ghế real-time</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💳</span>
                  <span>Thanh toán an toàn</span>
                </div>
              </div>
            </div>

            <div className="popup-footer">
              <p>🎉 Hơn 10,000 khách hàng đã tin tưởng chúng tôi!</p>
            </div>
          </div>
        </div>
  );
};

export default HomePromoPopup;

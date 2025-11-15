import React from 'react';
import { FaPhone, FaFacebookF } from 'react-icons/fa';
import './ContactButtons.css';

// Custom Zalo Icon Component - Official Zalo Logo Style
const ZaloIcon = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 32 32" 
    fill="none"
    className="zalo-icon"
  >
    {/* Background rounded square */}
    <rect 
      x="2" 
      y="2" 
      width="28" 
      height="28" 
      rx="6" 
      ry="6" 
      fill="#0068ff"
    />
    {/* Speech bubble */}
    <rect 
      x="6" 
      y="6" 
      width="20" 
      height="14" 
      rx="3" 
      ry="3" 
      fill="white"
    />
    {/* Speech bubble tail */}
    <path 
      d="M12 20 L8 24 L12 24 Z" 
      fill="white"
    />
    {/* Zalo text */}
    <text 
      x="16" 
      y="15" 
      textAnchor="middle" 
      fontSize="8" 
      fontWeight="bold" 
      fill="#0068ff"
      fontFamily="Arial, sans-serif"
    >
      Zalo
    </text>
  </svg>
);

const ContactButtons = () => {
  const handleZaloClick = () => {
    // Mở Zalo chat
    window.open('https://zalo.me/0987938261', '_blank');
  };

  const handleFacebookClick = () => {
    // Mở Facebook Messenger hoặc trang Facebook
    window.open('https://m.me/hascinema', '_blank');
  };

  const handlePhoneClick = () => {
    // Gọi điện thoại
    window.open('tel:0987938261', '_self');
  };

  return (
    <div className="contact-buttons-container">
      {/* Zalo Button */}
      <button 
        className="contact-btn zalo-btn"
        onClick={handleZaloClick}
      >
        <div className="btn-icon-wrapper">
          <ZaloIcon />
        </div>
        <div className="tooltip">Chat Zalo</div>
      </button>

      {/* Facebook Button */}
      <button 
        className="contact-btn facebook-btn"
        onClick={handleFacebookClick}
      >
        <div className="btn-icon-wrapper">
          <FaFacebookF className="btn-icon" />
        </div>
        <div className="tooltip">Facebook Messenger</div>
      </button>

      {/* Phone Button */}
      <button 
        className="contact-btn phone-btn"
        onClick={handlePhoneClick}
      >
        <div className="btn-icon-wrapper">
          <FaPhone className="btn-icon" />
        </div>
        <div className="tooltip">Gọi: 0987938261</div>
      </button>
    </div>
  );
};

export default ContactButtons;

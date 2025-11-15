import React from 'react';
import ContactButtons from './ContactButtons';
import './ContactButtonsDemo.css';

const ContactButtonsDemo = () => {
  return (
    <div className="demo-container">
      <div className="demo-content">
        <h1>Cafe Phim Style Contact Buttons</h1>
        <p>Scroll down to see the contact buttons in action!</p>
        <div className="demo-spacer"></div>
        <p>These buttons have the same effects as Cafe Phim website:</p>
        <ul>
          <li>✨ Floating animation</li>
          <li>🎯 Bounce effect every 5 seconds</li>
          <li>💫 Pulse glow effect</li>
          <li>🌊 Ripple effect on click</li>
          <li>🎨 Gradient backgrounds</li>
          <li>📱 Responsive design</li>
        </ul>
        <div className="demo-spacer"></div>
        <p>Try hovering and clicking the buttons!</p>
      </div>
      <ContactButtons />
    </div>
  );
};

export default ContactButtonsDemo;












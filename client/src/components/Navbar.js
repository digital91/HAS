import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaFilm, FaUser, FaUsers, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <Link to="/" className="logo">
              <FaFilm className="logo-icon" />
              <span>HAS Cinema</span>
            </Link>

            <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link 
                to="/movies" 
                className={`nav-link ${isActive('/movies') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Phim
              </Link>
              <Link 
                to="/rooms" 
                className={`nav-link ${isActive('/rooms') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUsers className="nav-icon" />
                Phòng chiếu
              </Link>
              {user && isAdmin() && (
                <>
                  <Link 
                    to="/admin/movies" 
                    className={`nav-link admin-link ${isActive('/admin/movies') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaCog className="nav-icon" />
                    Quản lý phim
                  </Link>
                  <Link 
                    to="/admin/images" 
                    className={`nav-link admin-link ${isActive('/admin/images') ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaCog className="nav-icon" />
                    Quản lý hình ảnh
                  </Link>
                </>
              )}
            </div>

            <div className="nav-actions">
              {user ? (
                <div className="user-menu">
                  <span className="user-info">
                    <FaUser className="btn-icon" />
                    {user.name}
                    {isAdmin() && <span className="admin-badge">Admin</span>}
                  </span>
                  <button 
                    className="btn btn-outline logout-btn"
                    onClick={logout}
                    title="Đăng xuất"
                  >
                    <FaSignOutAlt className="btn-icon" />
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowLogin(true)}
                >
                  <FaUser className="btn-icon" />
                  Đăng nhập
                </button>
              )}
            </div>

            <div className="hamburger" onClick={toggleMenu}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </nav>
      
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}
    </>
  );
};

export default Navbar;
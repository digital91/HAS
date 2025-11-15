import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaClock, FaTicketAlt } from 'react-icons/fa';
import './MovieCard.css';

const MovieCard = ({ movie, index, comingSoon = false }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'P':
        return '#4CAF50';
      case 'C13':
        return '#FF9800';
      case 'C16':
        return '#F44336';
      case 'C18':
        return '#9C27B0';
      default:
        return '#2196F3';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="movie-card"
    >
      <div className="card-image">
        <img src={movie.poster} alt={movie.title} />
        <div className="card-overlay">
          <div className="overlay-content">
            <div className="movie-rating" style={{ backgroundColor: getRatingColor(movie.rating) }}>
              {movie.rating}
            </div>
            {comingSoon ? (
              <div className="coming-soon-badge">
                Sắp chiếu
              </div>
            ) : (
              <div className="price-badge">
                {formatPrice(movie.price)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-content">
        <h3 className="movie-title">{movie.title}</h3>
        
        <div className="movie-meta">
          <div className="meta-item">
            <FaClock className="meta-icon" />
            <span>{movie.duration} phút</span>
          </div>
          <div className="meta-item">
            <FaStar className="meta-icon" />
            <span>{movie.genre[0]}</span>
          </div>
        </div>

        <p className="movie-description">
          {movie.description.length > 100 
            ? `${movie.description.substring(0, 100)}...` 
            : movie.description
          }
        </p>

        <div className="card-actions">
          <Link 
            to={`/movie/${movie._id}`}
            className="btn btn-primary"
          >
            <FaTicketAlt className="btn-icon" />
            {comingSoon ? 'Xem chi tiết' : 'Đặt phòng'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;

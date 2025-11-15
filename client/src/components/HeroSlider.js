import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaChevronLeft, FaChevronRight, FaStar, FaClock } from 'react-icons/fa';
import './HeroSlider.css';

const HeroSlider = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === movies.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, movies.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? movies.length - 1 : currentIndex - 1);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === movies.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlay(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="hero-slider">
        <div className="hero-placeholder">
          <h2>Chào mừng đến với HAS Cinema</h2>
          <p>Trải nghiệm phim ảnh tuyệt vời</p>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="hero-slider">
      <div className="slider-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="slide"
          >
            <div 
              className="slide-background"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${currentMovie.poster})`
              }}
            >
              <div className="slide-content">
                <div className="container">
                  <div className="slide-info">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="movie-badge"
                    >
                      {currentMovie.status === 'now-showing' ? 'Đang hot' : 'Sắp chiếu'}
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="movie-title"
                    >
                      {currentMovie.title}
                    </motion.h1>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="movie-meta"
                    >
                      <div className="meta-item">
                        <FaClock className="meta-icon" />
                        <span>{currentMovie.duration} phút</span>
                      </div>
                      <div className="meta-item">
                        <FaStar className="meta-icon" />
                        <span>{currentMovie.rating}</span>
                      </div>
                      <div className="meta-item">
                        <span>{currentMovie.genre.join(', ')}</span>
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="movie-description"
                    >
                      {currentMovie.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="slide-actions"
                    >
                      <Link 
                        to={`/movie/${currentMovie._id}`}
                        className="btn btn-primary btn-large"
                      >
                        <FaPlay className="btn-icon" />
                        Xem chi tiết
                      </Link>
                      {currentMovie.trailer && (
                        <button className="btn btn-outline btn-large">
                          Xem trailer
                        </button>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {movies.length > 1 && (
          <>
            <button className="nav-arrow nav-arrow-left" onClick={goToPrevious}>
              <FaChevronLeft />
            </button>
            <button className="nav-arrow nav-arrow-right" onClick={goToNext}>
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {movies.length > 1 && (
          <div className="dots-container">
            {movies.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;

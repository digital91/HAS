import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaClock, FaTicketAlt } from 'react-icons/fa';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import HeroSlider from '../components/HeroSlider';
import HomePromoPopup from '../components/HomePromoPopup';
import './Home.css';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/movies');
      setMovies(response.data);
    } catch (err) {
      setError('Không thể tải danh sách phim');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const nowShowingMovies = movies.filter(movie => movie.status === 'now-showing');

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Lỗi</h2>
        <p>{error}</p>
        <button onClick={fetchMovies} className="btn btn-primary">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Home Promo Popup */}
      <HomePromoPopup />
      
      {/* Hero Section */}
      <HeroSlider movies={nowShowingMovies.slice(0, 5)} />

      {/* Now Showing Section */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2 className="section-title">
              <FaTicketAlt className="title-icon" />
              Phim đang hot
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="movies-grid"
          >
            {nowShowingMovies.slice(0, 8).map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="section-footer"
          >
            <Link to="/movies" className="btn btn-outline">
              Xem tất cả
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Cinema Gallery Section */}
      <section className="section cinema-gallery-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2 className="section-title">
              Phòng chiếu của chúng tôi
            </h2>
            <p className="section-subtitle">Khám phá không gian hiện đại và tiện nghi</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="cinema-gallery"
          >
                  <div className="gallery-grid">
                    <div className="gallery-item">
                      <img src="/images/cinema-rooms/cinema-vip-room.jpg" alt="Phòng chiếu VIP" />
                      <div className="gallery-overlay">
                        <h3>Phòng chiếu VIP</h3>
                        <p>Trải nghiệm xem phim cao cấp với ghế massage</p>
                      </div>
                    </div>

                    <div className="gallery-item">
                      <img src="/images/cinema-rooms/cinema-3d-room.jpg" alt="Phòng chiếu 3D" />
                      <div className="gallery-overlay">
                        <h3>Phòng chiếu 3D</h3>
                        <p>Công nghệ 3D hiện đại</p>
                      </div>
                    </div>

                    <div className="gallery-item">
                      <img src="/images/cinema-rooms/cinema-standard-room.jpg" alt="Phòng chiếu thường" />
                      <div className="gallery-overlay">
                        <h3>Phòng chiếu thường</h3>
                        <p>Không gian rộng rãi, thoải mái</p>
                      </div>
                    </div>

                    <div className="gallery-item">
                      <img src="/images/cinema-rooms/cinema-lobby.jpg" alt="Sảnh chờ" />
                      <div className="gallery-overlay">
                        <h3>Sảnh chờ</h3>
                        <p>Không gian chờ đợi tiện nghi</p>
                      </div>
                    </div>

                    <div className="gallery-item">
                      <img src="/images/cinema-rooms/cinema-ticket-counter.jpg" alt="Quầy bán vé" />
                      <div className="gallery-overlay">
                        <h3>Quầy bán vé</h3>
                        <p>Dịch vụ chuyên nghiệp</p>
                      </div>
                    </div>

                    <div className="gallery-item">
                      <img src="/images/cinema-rooms/cinema-food-area.jpg" alt="Khu vực ăn uống" />
                      <div className="gallery-overlay">
                        <h3>Khu vực ăn uống</h3>
                        <p>Đồ ăn thức uống đa dạng</p>
                      </div>
                    </div>
                  </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="features-grid"
          >
            <div className="feature-card">
              <div className="feature-icon">
                <FaTicketAlt />
              </div>
              <h3>Đặt phòng dễ dàng</h3>
              <p>Đặt phòng trực tuyến nhanh chóng và tiện lợi</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaStar />
              </div>
              <h3>Phim chất lượng cao</h3>
              <p>Trải nghiệm phim với công nghệ hiện đại</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaClock />
              </div>
              <h3>Lịch chiếu linh hoạt</h3>
              <p>Nhiều suất chiếu phù hợp với thời gian của bạn</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaStar, FaClock, FaCalendarAlt, FaTicketAlt, FaArrowLeft, FaUser, FaVideo } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('');

  useEffect(() => {
    fetchMovieData();
    fetchTheaters();
  }, [id]);

  useEffect(() => {
    if (selectedDate && selectedTheater) {
      fetchShowtimes();
    }
  }, [selectedDate, selectedTheater]);

  const fetchMovieData = async () => {
    try {
      const response = await axios.get(`/api/movies/${id}`);
      setMovie(response.data);
    } catch (error) {
      toast.error('Không thể tải thông tin phim');
      console.error('Error fetching movie:', error);
    }
  };

  const fetchTheaters = async () => {
    try {
      const response = await axios.get('/api/theaters');
      setTheaters(response.data);
    } catch (error) {
      console.error('Error fetching theaters:', error);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const response = await axios.get(`/api/theaters/${selectedTheater}/showtimes`, {
        params: {
          date: selectedDate,
          movieId: id
        }
      });
      setShowtimes(response.data);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    } finally {
      setLoading(false);
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleBooking = (showtimeId) => {
    navigate(`/booking/${showtimeId}`);
  };

  if (loading && !movie) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Đang tải thông tin phim...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="error">
        <h2>Không tìm thấy phim</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft />
          Quay lại
        </button>

        <div className="movie-hero">
          <div className="movie-poster">
            <img src={movie.poster} alt={movie.title} />
            <div className="movie-rating" style={{ backgroundColor: getRatingColor(movie.rating) }}>
              {movie.rating}
            </div>
          </div>

          <div className="movie-info">
            <h1>{movie.title}</h1>
            
            <div className="movie-meta">
              <div className="meta-item">
                <FaClock className="meta-icon" />
                <span>{movie.duration} phút</span>
              </div>
              <div className="meta-item">
                <FaCalendarAlt className="meta-icon" />
                <span>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="meta-item">
                <FaUser className="meta-icon" />
                <span>{movie.director}</span>
              </div>
            </div>

            <div className="movie-genres">
              {movie.genre.map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>

            <p className="movie-description">{movie.description}</p>

            <div className="movie-cast">
              <h3>Diễn viên</h3>
              <p>{movie.cast.join(', ')}</p>
            </div>

            <div className="movie-actions">
              <div className="price-info">
                <span className="price-label">Giá phòng từ:</span>
                <span className="price-value">{formatPrice(movie.price)}</span>
              </div>
              {movie.trailer && (
                <button className="btn btn-outline">
                  <FaVideo className="btn-icon" />
                  Xem trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {movie.status === 'now-showing' && (
          <div className="booking-section">
            <h2>Đặt phòng</h2>
            
            <div className="booking-filters">
              <div className="filter-group">
                <label>Chọn rạp</label>
                <select
                  value={selectedTheater}
                  onChange={(e) => setSelectedTheater(e.target.value)}
                >
                  <option value="">Chọn rạp</option>
                  {theaters.map(theater => (
                    <option key={theater._id} value={theater._id}>
                      {theater.name} - {theater.location.district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Chọn ngày</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {selectedDate && selectedTheater && (
              <div className="showtimes">
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    Đang tải suất chiếu...
                  </div>
                ) : showtimes.length === 0 ? (
                  <div className="no-showtimes">
                    <p>Không có suất chiếu nào cho ngày đã chọn</p>
                  </div>
                ) : (
                  <div className="showtimes-grid">
                    {showtimes.map(showtime => (
                      <motion.div
                        key={showtime._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="showtime-card"
                      >
                        <div className="showtime-info">
                          <div className="showtime-time">{showtime.time}</div>
                          <div className="showtime-price">{formatPrice(showtime.price)}</div>
                          <div className="showtime-seats">
                            {showtime.availableSeats} ghế còn trống
                          </div>
                        </div>
                        <button
                          onClick={() => handleBooking(showtime._id)}
                          className="btn btn-primary"
                          disabled={showtime.availableSeats === 0}
                        >
                          <FaTicketAlt className="btn-icon" />
                          Đặt phòng
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;

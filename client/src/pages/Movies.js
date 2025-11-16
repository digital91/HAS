import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, selectedGenre]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/movies');
      setMovies(response.data);
      
      // Extract unique genres
      const uniqueGenres = [...new Set(response.data.flatMap(movie => movie.genre))];
      setGenres(uniqueGenres);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMovies = () => {
    let filtered = movies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter(movie => movie.genre.includes(selectedGenre));
    }

    setFilteredMovies(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
  };

  if (loading) {
    return (
      <div className="movies-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tải danh sách phim...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="movies-page">
      <div className="container">
        <div className="movies-header">
          <h1>Danh sách phim</h1>
          <p>Khám phá những bộ phim hay nhất đang hot</p>
        </div>

        {/* Search and Filter */}
        <div className="movies-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm phim, đạo diễn, diễn viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <FaFilter className="filter-icon" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">Tất cả thể loại</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedGenre) && (
            <button className="clear-filters" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Movies Grid */}
        <div className="movies-grid">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="movie-card"
              >
                <div className="movie-poster">
                  <img src={movie.poster} alt={movie.title} />
                  <div className="movie-overlay">
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p className="movie-director">Đạo diễn: {movie.director}</p>
                      <p className="movie-duration">Thời lượng: {movie.duration} phút</p>
                      <div className="movie-genres">
                        {movie.genre.map((genre, idx) => (
                          <span key={idx} className="genre-tag">{genre}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="movie-details">
                  <h3>{movie.title}</h3>
                  <p className="movie-description">{movie.description}</p>
                  <div className="movie-meta">
                    <span className="movie-rating">⭐ {movie.rating}/5</span>
                    <span className="movie-status">{movie.status === 'now-showing' ? 'Đang hot' : 'Sắp chiếu'}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="no-movies">
              <p>Không tìm thấy phim nào phù hợp với bộ lọc của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Movies;
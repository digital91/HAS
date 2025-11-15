import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaStar, FaImage } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './MovieManagement.css';

const MovieManagement = () => {
  const { isAdmin } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    director: '',
    cast: '',
    poster: '',
    trailer: '',
    status: 'now-showing',
    rating: '',
    price: '',
    releaseDate: ''
  });

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    fetchMovies();
  }, [isAdmin]);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/movies');
      setMovies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Lỗi khi tải danh sách phim');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const movieData = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()),
        cast: formData.cast.split(',').map(c => c.trim()),
        duration: parseInt(formData.duration),
        rating: parseFloat(formData.rating), // Convert to number
        price: parseFloat(formData.price),
        releaseDate: new Date(formData.releaseDate)
      };

      // Get token from localStorage or sessionStorage
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      if (!token) {
        toast.error('Bạn cần đăng nhập để thực hiện thao tác này');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post('http://localhost:5000/api/movies', movieData, { headers });
      toast.success('Thêm phim thành công!');
      setIsAddModalOpen(false);
      resetForm();
      fetchMovies();
    } catch (error) {
      console.error('Error adding movie:', error);
      toast.error('Lỗi khi thêm phim');
    }
  };

  const handleEditMovie = async (e) => {
    e.preventDefault();
    try {
      const movieData = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()),
        cast: formData.cast.split(',').map(c => c.trim()),
        duration: parseInt(formData.duration),
        rating: parseFloat(formData.rating), // Convert to number
        price: parseFloat(formData.price),
        releaseDate: new Date(formData.releaseDate)
      };

      console.log('Updating movie:', selectedMovie._id, movieData);
      
      // Get token from localStorage or sessionStorage
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      if (!token) {
        toast.error('Bạn cần đăng nhập để thực hiện thao tác này');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log('Request headers:', headers);
      console.log('Request URL:', `http://localhost:5000/api/movies/${selectedMovie._id}`);
      
      const response = await axios.put(`http://localhost:5000/api/movies/${selectedMovie._id}`, movieData, { headers });
      console.log('Update successful:', response.data);
      
      toast.success('Cập nhật phim thành công!');
      setIsEditModalOpen(false);
      setSelectedMovie(null);
      resetForm();
      fetchMovies();
    } catch (error) {
      console.error('Error updating movie:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      toast.error('Lỗi khi cập nhật phim: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      try {
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        await axios.delete(`http://localhost:5000/api/movies/${movieId}`, { headers });
        toast.success('Xóa phim thành công!');
        fetchMovies();
      } catch (error) {
        console.error('Error deleting movie:', error);
        toast.error('Lỗi khi xóa phim');
      }
    }
  };

  const openEditModal = (movie) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
      duration: movie.duration.toString(),
      director: movie.director,
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast,
      poster: movie.poster,
      trailer: movie.trailer || '',
      status: movie.status,
      rating: movie.rating ? movie.rating.toString() : '',
      price: movie.price ? movie.price.toString() : '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      duration: '',
      director: '',
      cast: '',
      poster: '',
      trailer: '',
      status: 'now-showing',
      rating: '',
      price: '',
      releaseDate: ''
    });
  };

  if (!isAdmin()) {
    return (
      <div className="movie-management">
        <div className="container">
          <div className="access-denied">
            <h2>Không có quyền truy cập</h2>
            <p>Chỉ admin mới có thể truy cập trang này.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="movie-management">
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
    <div className="movie-management">
      <div className="container">
        <div className="management-header">
          <h1>Quản lý phim</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <FaPlus /> Thêm phim mới
          </button>
        </div>

        <div className="movies-table">
          <table>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Tên phim</th>
                <th>Thể loại</th>
                <th>Đạo diễn</th>
                <th>Thời lượng</th>
                <th>Đánh giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie, index) => (
                <motion.tr
                  key={movie._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td>
                    <div className="movie-poster">
                      <img src={movie.poster} alt={movie.title} />
                    </div>
                  </td>
                  <td>
                    <div className="movie-title">
                      <h3>{movie.title}</h3>
                      <p className="movie-description">{movie.description}</p>
                    </div>
                  </td>
                  <td>
                    <div className="movie-genres">
                      {Array.isArray(movie.genre) ? movie.genre.map((g, idx) => (
                        <span key={idx} className="genre-tag">{g}</span>
                      )) : <span className="genre-tag">{movie.genre}</span>}
                    </div>
                  </td>
                  <td>{movie.director}</td>
                  <td>{movie.duration} phút</td>
                  <td>
                    <div className="movie-rating">
                      <FaStar className="star-icon" />
                      <span>{movie.rating}/5</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${movie.status}`}>
                      {movie.status === 'now-showing' ? 'Đang hot' : 'Sắp chiếu'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-edit"
                        onClick={() => openEditModal(movie)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDeleteMovie(movie._id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Movie Modal */}
        {isAddModalOpen && (
          <MovieFormModal
            title="Thêm phim mới"
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleAddMovie}
            onClose={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
          />
        )}

        {/* Edit Movie Modal */}
        {isEditModalOpen && selectedMovie && (
          <MovieFormModal
            title="Chỉnh sửa phim"
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleEditMovie}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedMovie(null);
              resetForm();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Movie Form Modal Component
const MovieFormModal = ({ title, formData, onInputChange, onSubmit, onClose }) => {
  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="movie-form-modal"
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="movie-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tên phim *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                required
                placeholder="Nhập tên phim"
              />
            </div>
            <div className="form-group">
              <label>Đạo diễn *</label>
              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={onInputChange}
                required
                placeholder="Nhập tên đạo diễn"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              required
              rows="3"
              placeholder="Nhập mô tả phim"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Thể loại *</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={onInputChange}
                required
                placeholder="Hành động, Hài, Lãng mạn (phân cách bằng dấu phẩy)"
              />
            </div>
            <div className="form-group">
              <label>Diễn viên *</label>
              <input
                type="text"
                name="cast"
                value={formData.cast}
                onChange={onInputChange}
                required
                placeholder="Diễn viên 1, Diễn viên 2 (phân cách bằng dấu phẩy)"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Thời lượng (phút) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={onInputChange}
                required
                min="1"
                placeholder="120"
              />
            </div>
            <div className="form-group">
              <label>Đánh giá (1-5 sao) *</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={onInputChange}
                required
                min="1"
                max="5"
                step="0.1"
                placeholder="4.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá vé (VNĐ) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                required
                min="0"
                placeholder="150000"
              />
            </div>
            <div className="form-group">
              <label>Ngày phát hành *</label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={onInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>URL Poster *</label>
            <input
              type="url"
              name="poster"
              value={formData.poster}
              onChange={onInputChange}
              required
              placeholder="https://example.com/poster.jpg"
            />
          </div>

          <div className="form-group">
            <label>URL Trailer</label>
            <input
              type="url"
              name="trailer"
              value={formData.trailer}
              onChange={onInputChange}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="form-group">
            <label>Trạng thái *</label>
            <select
              name="status"
              value={formData.status}
              onChange={onInputChange}
              required
            >
              <option value="now-showing">Đang hot</option>
              <option value="coming-soon">Sắp chiếu</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <FaSave /> Lưu
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MovieManagement;

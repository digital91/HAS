import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaTrash, FaPlus, FaFolder } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';
import './ImageManagement.css';

const ImageManagement = () => {
  const { isAdmin } = useAuth();
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('cinema-rooms');
  const [showUpload, setShowUpload] = useState(false);

  const categories = [
    { key: 'cinema-rooms', name: 'Phòng chiếu', icon: <FaImage /> },
    { key: 'movies', name: 'Phim', icon: <FaImage /> },
    { key: 'thumbnails', name: 'Thumbnails', icon: <FaImage /> },
    { key: 'uploads', name: 'Uploads', icon: <FaFolder /> }
  ];

  useEffect(() => {
    if (!isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    fetchAllImages();
  }, [isAdmin]);

  const fetchAllImages = async () => {
    try {
      setLoading(true);
      const imageData = {};
      
      for (const category of categories) {
        try {
          const response = await axios.get(`/api/upload/list/${category.key}`);
          if (response.data.success) {
            imageData[category.key] = response.data.data;
          }
        } catch (error) {
          console.error(`Error fetching ${category.key}:`, error);
          imageData[category.key] = [];
        }
      }
      
      setImages(imageData);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Lỗi khi tải danh sách hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedFiles) => {
    toast.success(`Upload thành công ${uploadedFiles.length} file`);
    setShowUpload(false);
    fetchAllImages(); // Refresh the list
  };

  const handleDeleteImage = async (category, filename) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này?')) {
      return;
    }

    try {
      // Get token from localStorage or sessionStorage
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      if (!token) {
        toast.error('Bạn cần đăng nhập để xóa hình ảnh');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`/api/upload/${category}/${filename}`, { headers });
      
      if (response.data.success) {
        toast.success('Xóa hình ảnh thành công');
        fetchAllImages(); // Refresh the list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Lỗi khi xóa hình ảnh');
    }
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    toast.success('Đã copy URL vào clipboard');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Đang tải...
      </div>
    );
  }

  return (
    <div className="image-management">
      <div className="page-header">
        <h1>Quản lý hình ảnh</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn btn-primary"
        >
          <FaPlus />
          Upload hình ảnh
        </button>
      </div>

      {showUpload && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="upload-section"
        >
          <h2>Upload hình ảnh mới</h2>
          <ImageUpload
            category={activeCategory}
            multiple={true}
            onUploadSuccess={handleUploadSuccess}
          />
        </motion.div>
      )}

      <div className="categories-tabs">
        {categories.map(category => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`tab-btn ${activeCategory === category.key ? 'active' : ''}`}
          >
            {category.icon}
            {category.name}
            <span className="count">
              {images[category.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="images-grid">
        {images[activeCategory]?.length > 0 ? (
          images[activeCategory].map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="image-card"
            >
              <div className="image-preview">
                <img 
                  src={image.url} 
                  alt={image.filename}
                  loading="lazy"
                />
                <div className="image-overlay">
                  <button
                    onClick={() => copyImageUrl(image.url)}
                    className="action-btn copy-btn"
                    title="Copy URL"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => handleDeleteImage(activeCategory, image.filename)}
                    className="action-btn delete-btn"
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="image-info">
                <p className="filename">{image.filename}</p>
                <p className="url">{image.url}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="empty-state">
            <FaImage className="empty-icon" />
            <h3>Chưa có hình ảnh nào</h3>
            <p>Hãy upload hình ảnh đầu tiên cho danh mục này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageManagement;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaImage, FaTrash, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './ImageUpload.css';

const ImageUpload = ({ category = 'uploads', onUploadSuccess, multiple = false }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (imageFiles.length !== fileArray.length) {
      toast.error('Một số file không hợp lệ hoặc quá lớn (tối đa 5MB)');
    }

    if (multiple) {
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    } else {
      setSelectedFiles(imageFiles.slice(0, 1));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn file để upload');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('category', category);
      
      if (multiple) {
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.append('image', selectedFiles[0]);
      }

      // Get token from localStorage or sessionStorage
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = savedUser ? JSON.parse(savedUser).token : null;
      
      if (!token) {
        toast.error('Bạn cần đăng nhập để upload file');
        setUploading(false);
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      const endpoint = multiple ? '/api/upload/multiple' : '/api/upload/single';
      const response = await axios.post(endpoint, formData, { headers });

      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedFiles([]);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền upload file. Cần quyền admin.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Lỗi khi upload file: ' + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="image-upload">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="file-input"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="upload-label">
          <FaUpload className="upload-icon" />
          <p>Kéo thả hình ảnh vào đây hoặc click để chọn</p>
          <span className="upload-hint">
            Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB)
          </span>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4>Files đã chọn ({selectedFiles.length}):</h4>
          <div className="file-list">
            {selectedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="file-item"
              >
                <div className="file-preview">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name}
                    className="preview-image"
                  />
                </div>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="remove-btn"
                  type="button"
                >
                  <FaTrash />
                </button>
              </motion.div>
            ))}
          </div>
          
          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="upload-btn"
            >
              {uploading ? (
                <>
                  <div className="spinner"></div>
                  Đang upload...
                </>
              ) : (
                <>
                  <FaCheck />
                  Upload {selectedFiles.length} file
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;


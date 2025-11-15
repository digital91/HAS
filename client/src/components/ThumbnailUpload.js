import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaImage, FaTimes } from 'react-icons/fa';
import './ThumbnailUpload.css';

const ThumbnailUpload = ({ 
  currentThumbnail, 
  onThumbnailChange, 
  onUrlChange,
  roomName 
}) => {
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [imageUrl, setImageUrl] = useState(currentThumbnail?.thumbnailUrl || '');
  const [previewUrl, setPreviewUrl] = useState(currentThumbnail?.thumbnailUrl || '');

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
    if (onUrlChange) {
      onUrlChange(url);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target.result;
        setPreviewUrl(url);
        if (onThumbnailChange) {
          onThumbnailChange(file, url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setImageUrl('');
    setPreviewUrl('');
    if (onUrlChange) {
      onUrlChange('');
    }
  };

  const presetThumbnails = [
    {
      name: 'Standard Room',
      url: '/images/cinema-rooms/cinema-standard-room.jpg',
      type: 'standard'
    },
    {
      name: 'VIP Room',
      url: '/images/cinema-rooms/cinema-vip-room.jpg',
      type: 'vip'
    },
    {
      name: '3D Room',
      url: '/images/cinema-rooms/cinema-3d-room.jpg',
      type: '3d'
    },
    {
      name: 'Lobby Area',
      url: '/images/cinema-rooms/cinema-lobby.jpg',
      type: 'lobby'
    }
  ];

  const handlePresetSelect = (preset) => {
    setImageUrl(preset.url);
    setPreviewUrl(preset.url);
    if (onUrlChange) {
      onUrlChange(preset.url);
    }
  };

  return (
    <div className="thumbnail-upload">
      <h4>Thumbnail cho {roomName}</h4>
      
      {/* Upload Method Selection */}
      <div className="upload-method">
        <button 
          className={`method-btn ${uploadMethod === 'url' ? 'active' : ''}`}
          onClick={() => setUploadMethod('url')}
        >
          <FaImage /> URL
        </button>
        <button 
          className={`method-btn ${uploadMethod === 'file' ? 'active' : ''}`}
          onClick={() => setUploadMethod('file')}
        >
          <FaUpload /> File
        </button>
      </div>

      {/* URL Upload */}
      {uploadMethod === 'url' && (
        <div className="url-upload">
          <div className="input-group">
            <input
              type="url"
              placeholder="Nhập URL hình ảnh..."
              value={imageUrl}
              onChange={handleUrlChange}
              className="url-input"
            />
            {imageUrl && (
              <button 
                onClick={handleRemoveThumbnail}
                className="remove-btn"
                title="Xóa thumbnail"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      )}

      {/* File Upload */}
      {uploadMethod === 'file' && (
        <div className="file-upload">
          <label className="file-upload-label">
            <FaUpload />
            <span>Chọn file hình ảnh</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="file-input"
            />
          </label>
        </div>
      )}

      {/* Preset Thumbnails */}
      <div className="preset-thumbnails">
        <h5>Hoặc chọn từ mẫu có sẵn:</h5>
        <div className="preset-grid">
          {presetThumbnails.map((preset, index) => (
            <motion.div
              key={index}
              className={`preset-item ${previewUrl === preset.url ? 'selected' : ''}`}
              onClick={() => handlePresetSelect(preset)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={preset.url} alt={preset.name} />
              <span>{preset.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="thumbnail-preview">
          <h5>Xem trước:</h5>
          <div className="preview-container">
            <img src={previewUrl} alt="Thumbnail preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailUpload;


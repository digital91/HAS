const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Danh sách các category được phép upload (chống path traversal)
const allowedCategories = ['uploads', 'movies', 'posters', 'thumbnails', 'gallery', 'cinema-rooms'];

// Validate và sanitize category
const validateCategory = (category) => {
  if (!category) return 'uploads';
  // Chỉ cho phép alphanumeric và dấu gạch ngang
  const sanitized = category.replace(/[^a-zA-Z0-9-]/g, '');
  return allowedCategories.includes(sanitized) ? sanitized : 'uploads';
};

// Cấu hình multer cho upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Validate category để chống path traversal
    const category = validateCategory(req.body.category);
    const uploadPath = path.join(__dirname, '..', 'public', 'images', category);
    
    // Đảm bảo path không vượt ra ngoài thư mục images
    const normalizedPath = path.normalize(uploadPath);
    const imagesBasePath = path.join(__dirname, '..', 'public', 'images');
    if (!normalizedPath.startsWith(imagesBasePath)) {
      return cb(new Error('Invalid upload path'));
    }
    
    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filter file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file hình ảnh (JPEG, PNG, GIF, WebP)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload single image
router.post('/single', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không có file được upload' 
      });
    }

    const category = validateCategory(req.body.category);
    const imageUrl = `/images/${category}/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Upload thành công',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi upload file' 
    });
  }
});

// Upload multiple images
router.post('/multiple', authenticateToken, requireAdmin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không có file nào được upload' 
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/images/${validateCategory(req.body.category)}/${file.filename}`
    }));
    
    res.json({
      success: true,
      message: `Upload thành công ${uploadedFiles.length} file`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi upload files' 
    });
  }
});

// Get list of images in a category
router.get('/list/:category?', (req, res) => {
  try {
    const category = validateCategory(req.params.category);
    const imagePath = path.join(__dirname, '..', 'public', 'images', category);
    
    // Đảm bảo path không vượt ra ngoài thư mục images
    const normalizedPath = path.normalize(imagePath);
    const imagesBasePath = path.join(__dirname, '..', 'public', 'images');
    if (!normalizedPath.startsWith(imagesBasePath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid category' 
      });
    }
    
    if (!fs.existsSync(imagePath)) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const files = fs.readdirSync(imagePath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => ({
        filename: file,
        url: `/images/${category}/${file}`,
        path: path.join(imagePath, file)
      }));
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách hình ảnh' 
    });
  }
});

// Delete image
router.delete('/:category/:filename', authenticateToken, requireAdmin, (req, res) => {
  try {
    const category = validateCategory(req.params.category);
    const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, ''); // Sanitize filename
    const filePath = path.join(__dirname, '..', 'public', 'images', category, filename);
    
    // Đảm bảo path không vượt ra ngoài thư mục images
    const normalizedPath = path.normalize(filePath);
    const imagesBasePath = path.join(__dirname, '..', 'public', 'images');
    if (!normalizedPath.startsWith(imagesBasePath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file path' 
      });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File không tồn tại' 
      });
    }
    
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Xóa file thành công'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa file' 
    });
  }
});

module.exports = router;


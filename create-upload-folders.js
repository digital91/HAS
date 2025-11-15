const fs = require('fs');
const path = require('path');

// Tạo các thư mục upload cần thiết
const uploadFolders = [
  'server/public/images/uploads',
  'server/public/images/movies',
  'server/public/images/cinema-rooms',
  'server/public/images/thumbnails',
  'server/public/images/posters',
  'server/public/images/gallery'
];

console.log('🔧 Tạo thư mục upload...');

uploadFolders.forEach(folder => {
  try {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`✅ Đã tạo thư mục: ${folder}`);
    } else {
      console.log(`📁 Thư mục đã tồn tại: ${folder}`);
    }
  } catch (error) {
    console.error(`❌ Lỗi khi tạo thư mục ${folder}:`, error.message);
  }
});

console.log('🎉 Hoàn thành tạo thư mục upload!');


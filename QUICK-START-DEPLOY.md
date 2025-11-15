# ⚡ QUICK START - DEPLOY HAS CINEMA LÊN VPS

## 🎯 Tóm tắt nhanh

### Công cụ miễn phí sử dụng:
- ✅ **PM2** - Quản lý process Node.js
- ✅ **Nginx** - Reverse proxy & web server  
- ✅ **Let's Encrypt** - SSL certificate miễn phí
- ✅ **MongoDB Atlas** - Database cloud (free tier 512MB)
- ✅ **Git** - Deploy code

---

## 📝 5 BƯỚC ĐỂ DEPLOY

### Bước 1: Setup VPS (chạy 1 lần)
```bash
# Upload file setup-vps.sh lên VPS, sau đó:
chmod +x setup-vps.sh
./setup-vps.sh
```

### Bước 2: Clone dự án
```bash
cd ~
git clone <your-repo-url> projects/cinemas-has
cd projects/cinemas-has
```

### Bước 3: Cấu hình
```bash
# Cấu hình MongoDB và các biến môi trường
cd server
cp config.env.production config.env
nano config.env  # Chỉnh sửa các giá trị cần thiết
```

### Bước 4: Deploy
```bash
# Chạy script deploy
cd ~/projects/cinemas-has
chmod +x deploy.sh
./deploy.sh
```

### Bước 5: Cấu hình Nginx & SSL
```bash
# Copy file nginx config
sudo cp nginx-has-cinema.conf /etc/nginx/sites-available/has-cinema

# Chỉnh sửa domain trong file
sudo nano /etc/nginx/sites-available/has-cinema
# Thay "yourdomain.com" bằng domain của bạn

# Tạo symlink
sudo ln -s /etc/nginx/sites-available/has-cinema /etc/nginx/sites-enabled/

# Test và reload
sudo nginx -t
sudo systemctl reload nginx

# Lấy SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔧 CẤU HÌNH QUAN TRỌNG

### MongoDB Atlas (Khuyến nghị)
1. Đăng ký tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster free
3. Lấy connection string
4. Cập nhật vào `server/config.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinemas-has?retryWrites=true&w=majority
   ```

### JWT Secret
```bash
# Tạo secret mạnh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copy kết quả vào config.env
```

### Domain
- Trỏ A record về IP VPS
- Đợi DNS propagate (5-30 phút)

---

## 📊 QUẢN LÝ SAU KHI DEPLOY

### PM2 Commands
```bash
pm2 status                    # Xem trạng thái
pm2 logs has-cinema-server    # Xem logs
pm2 restart has-cinema-server # Restart
pm2 monit                     # Monitor real-time
```

### Deploy lại (sau khi update code)
```bash
cd ~/projects/cinemas-has
./deploy.sh
```

### Nginx
```bash
sudo nginx -t              # Test config
sudo systemctl reload nginx # Reload
sudo tail -f /var/log/nginx/error.log  # Xem logs
```

---

## 🆘 XỬ LÝ LỖI THƯỜNG GẶP

### 502 Bad Gateway
```bash
# Kiểm tra app có chạy không
pm2 status

# Kiểm tra logs
pm2 logs has-cinema-server --err
```

### Port 5000 không mở
```bash
# Kiểm tra
sudo netstat -tlnp | grep 5000

# Nếu không có, restart PM2
pm2 restart has-cinema-server
```

### SSL không hoạt động
```bash
# Test SSL
sudo certbot certificates

# Renew
sudo certbot renew
```

---

## 📚 TÀI LIỆU CHI TIẾT

Xem file **DEPLOYMENT-GUIDE.md** để biết hướng dẫn chi tiết đầy đủ.

---

**Chúc bạn deploy thành công! 🚀**


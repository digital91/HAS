# 🚀 HƯỚNG DẪN DEPLOY DỰ ÁN HAS CINEMA LÊN VPS

**Công cụ miễn phí sử dụng:**
- ✅ **PM2** - Process Manager cho Node.js (miễn phí)
- ✅ **Nginx** - Reverse Proxy & Web Server (miễn phí)
- ✅ **Let's Encrypt** - SSL Certificate (miễn phí)
- ✅ **MongoDB Atlas** - Database Cloud (free tier) hoặc MongoDB Community
- ✅ **Git** - Version Control (miễn phí)
- ✅ **Node.js** - Runtime (miễn phí)

---

## 📋 YÊU CẦU HỆ THỐNG

- **VPS:** Ubuntu 20.04+ hoặc Debian 11+ (khuyến nghị)
- **RAM:** Tối thiểu 1GB (khuyến nghị 2GB+)
- **CPU:** 1 core trở lên
- **Disk:** 20GB trở lên
- **Domain:** Có domain name (hoặc dùng IP)

---

## 🔧 BƯỚC 1: CHUẨN BỊ VPS

### 1.1. Kết nối VPS
```bash
ssh root@your-vps-ip
# hoặc
ssh username@your-vps-ip
```

### 1.2. Cập nhật hệ thống
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3. Tạo user mới (khuyến nghị)
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

---

## 📦 BƯỚC 2: CÀI ĐẶT CÁC CÔNG CỤ CẦN THIẾT

### 2.1. Cài đặt Node.js (LTS version)
```bash
# Cài đặt Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra version
node --version  # Nên là v18.x.x
npm --version
```

### 2.2. Cài đặt PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Cài đặt PM2 startup script để tự động khởi động khi server reboot
pm2 startup
# Chạy lệnh mà PM2 hiển thị (thường là: sudo env PATH=...)
```

### 2.3. Cài đặt Nginx
```bash
sudo apt install -y nginx

# Khởi động Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Kiểm tra status
sudo systemctl status nginx
```

### 2.4. Cài đặt Git
```bash
sudo apt install -y git
```

### 2.5. Cài đặt MongoDB (Tùy chọn)

**Option 1: MongoDB Atlas (Khuyến nghị - Free tier)**
- Truy cập: https://www.mongodb.com/cloud/atlas
- Tạo account miễn phí
- Tạo cluster free (512MB storage)
- Lấy connection string

**Option 2: Cài MongoDB trên VPS**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Thêm MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Cài đặt MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Khởi động MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Kiểm tra status
sudo systemctl status mongod
```

---

## 🔐 BƯỚC 3: CÀI ĐẶT SSL VỚI LET'S ENCRYPT

### 3.1. Cài đặt Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2. Cấu hình Nginx cơ bản trước (sẽ cấu hình chi tiết ở bước sau)
```bash
# Tạo file config cho domain của bạn
sudo nano /etc/nginx/sites-available/has-cinema
```

**Nội dung file:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Tạo symbolic link
sudo ln -s /etc/nginx/sites-available/has-cinema /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3.3. Lấy SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot sẽ tự động:
- Tạo SSL certificate
- Cấu hình Nginx để sử dụng HTTPS
- Tự động renew certificate

---

## 📂 BƯỚC 4: DEPLOY DỰ ÁN

### 4.1. Tạo thư mục cho dự án
```bash
mkdir -p ~/projects
cd ~/projects
```

### 4.2. Clone dự án từ Git
```bash
# Nếu dự án trên GitHub/GitLab
git clone https://github.com/yourusername/cinemas-has.git
cd cinemas-has

# Hoặc upload code lên VPS bằng SCP
# scp -r /path/to/local/project user@vps-ip:~/projects/cinemas-has
```

### 4.3. Cài đặt dependencies
```bash
# Cài đặt dependencies cho root project
npm install

# Cài đặt dependencies cho server
cd server
npm install --production

# Cài đặt dependencies cho client
cd ../client
npm install

# Build React app
npm run build
```

### 4.4. Cấu hình environment variables
```bash
cd ~/projects/cinemas-has/server

# Copy file config mẫu
cp config.env.production config.env

# Chỉnh sửa config.env
nano config.env
```

**Cập nhật các giá trị:**
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinemas-has?retryWrites=true&w=majority
# hoặc nếu dùng MongoDB local:
# MONGODB_URI=mongodb://localhost:27017/cinemas-has

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration - TẠO SECRET MẠNH!
JWT_SECRET=your-super-secure-random-secret-key-here
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=https://yourdomain.com

# Security Settings
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

**Tạo JWT_SECRET mạnh:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4.5. Tạo thư mục logs
```bash
cd ~/projects/cinemas-has/server
mkdir -p logs
```

---

## ⚙️ BƯỚC 5: CẤU HÌNH PM2

### 5.1. Cập nhật ecosystem.config.js
File đã có sẵn, chỉ cần đảm bảo đúng path:
```bash
cd ~/projects/cinemas-has/server
nano ecosystem.config.js
```

### 5.2. Khởi động ứng dụng với PM2
```bash
cd ~/projects/cinemas-has/server

# Khởi động với PM2
pm2 start ecosystem.config.js --env production

# Lưu PM2 process list để tự động khởi động khi reboot
pm2 save

# Kiểm tra status
pm2 status
pm2 logs has-cinema-server
```

---

## 🌐 BƯỚC 6: CẤU HÌNH NGINX HOÀN CHỈNH

### 6.1. Cập nhật Nginx config
```bash
sudo nano /etc/nginx/sites-available/has-cinema
```

**Cấu hình đầy đủ:**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (Certbot tự động thêm)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Client body size limit (for file uploads)
    client_max_body_size 10M;

    # Serve React static files
    location / {
        root /home/deploy/projects/cinemas-has/client/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.io Proxy
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Serve uploaded images
    location /images {
        alias /home/deploy/projects/cinemas-has/server/public/images;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

### 6.2. Test và reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔥 BƯỚC 7: CẤU HÌNH FIREWALL

### 7.1. Cấu hình UFW (Uncomplicated Firewall)
```bash
# Cho phép SSH
sudo ufw allow 22/tcp

# Cho phép HTTP và HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Kích hoạt firewall
sudo ufw enable

# Kiểm tra status
sudo ufw status
```

---

## 📊 BƯỚC 8: MONITORING VÀ MAINTENANCE

### 8.1. PM2 Commands hữu ích
```bash
# Xem logs
pm2 logs has-cinema-server

# Xem logs real-time
pm2 logs has-cinema-server --lines 100

# Restart app
pm2 restart has-cinema-server

# Stop app
pm2 stop has-cinema-server

# Xem thông tin chi tiết
pm2 show has-cinema-server

# Xem monitoring
pm2 monit
```

### 8.2. Kiểm tra Nginx logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 8.3. Kiểm tra MongoDB (nếu cài local)
```bash
# Kết nối MongoDB
mongosh

# Hoặc
mongo
```

---

## 🔄 BƯỚC 9: DEPLOY SCRIPT TỰ ĐỘNG

Tạo script để deploy dễ dàng hơn:

```bash
nano ~/deploy.sh
```

**Nội dung script:**
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd ~/projects/cinemas-has

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install --production && cd ..
cd client && npm install && cd ..

# Build React app
echo "🏗️ Building React app..."
cd client
npm run build
cd ..

# Restart PM2
echo "🔄 Restarting application..."
cd server
pm2 restart has-cinema-server

echo "✅ Deployment completed!"
pm2 status
```

**Cấp quyền thực thi:**
```bash
chmod +x ~/deploy.sh
```

**Sử dụng:**
```bash
~/deploy.sh
```

---

## 🛡️ BƯỚC 10: BẢO MẬT BỔ SUNG

### 10.1. Fail2Ban (Chống brute force)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 10.2. Auto-update security patches
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 10.3. Disable root login (nếu chưa)
```bash
sudo nano /etc/ssh/sshd_config
# Đặt: PermitRootLogin no
sudo systemctl restart sshd
```

---

## 📝 CHECKLIST DEPLOYMENT

- [ ] VPS đã được cấu hình
- [ ] Node.js đã cài đặt
- [ ] PM2 đã cài đặt và cấu hình
- [ ] Nginx đã cài đặt và cấu hình
- [ ] SSL certificate đã được cài đặt
- [ ] MongoDB đã được cấu hình (Atlas hoặc local)
- [ ] Environment variables đã được cấu hình
- [ ] Dependencies đã được cài đặt
- [ ] React app đã được build
- [ ] PM2 đã khởi động ứng dụng
- [ ] Firewall đã được cấu hình
- [ ] Domain đã trỏ về VPS IP
- [ ] Website đã hoạt động trên HTTPS

---

## 🆘 TROUBLESHOOTING

### Lỗi: PM2 không khởi động
```bash
# Kiểm tra logs
pm2 logs has-cinema-server --err

# Kiểm tra config
pm2 show has-cinema-server
```

### Lỗi: Nginx 502 Bad Gateway
```bash
# Kiểm tra Node.js app có chạy không
pm2 status

# Kiểm tra port 5000
sudo netstat -tlnp | grep 5000

# Kiểm tra Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Lỗi: MongoDB connection
```bash
# Kiểm tra MongoDB có chạy không (nếu local)
sudo systemctl status mongod

# Test connection
mongosh "mongodb://localhost:27017/cinemas-has"
```

### Lỗi: SSL certificate
```bash
# Test SSL
sudo certbot certificates

# Renew manually
sudo certbot renew --dry-run
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

**Chúc bạn deploy thành công! 🎉**


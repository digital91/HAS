# 🔧 SỬA LỖI: Optional Chaining không hỗ trợ trong Node.js cũ

## ❌ Lỗi gặp phải:

```
SyntaxError: Unexpected token '.'
at booking.showtime?.movie?.title
```

## 🔍 Nguyên nhân:

**Optional Chaining (`?.`)** chỉ được hỗ trợ từ **Node.js 14.0.0+**

Nếu bạn đang dùng Node.js 12 hoặc thấp hơn, sẽ gặp lỗi này.

## ✅ Giải pháp đã áp dụng:

### 1. Thay Optional Chaining bằng kiểm tra thông thường

**Trước (không tương thích):**
```javascript
booking.showtime?.movie?.title
booking.seats?.map(...)
booking.totalPrice?.toLocaleString(...)
```

**Sau (tương thích với mọi Node.js):**
```javascript
(booking.showtime && booking.showtime.movie && booking.showtime.movie.title)
(booking.seats && Array.isArray(booking.seats) && booking.seats.map(...))
(booking.totalPrice && booking.totalPrice.toLocaleString(...))
```

### 2. Đã sửa trong file `server/utils/email.js`

Tất cả optional chaining đã được thay thế bằng cách kiểm tra thông thường.

## 🧪 Test lại:

```bash
cd ~/projects/cinemas-has/server
node test-email.js
```

## 📊 Kiểm tra version Node.js:

```bash
node --version
```

**Khuyến nghị:**
- ✅ Node.js 14.x hoặc cao hơn (để dùng optional chaining)
- ✅ Node.js 18.x LTS (khuyến nghị cho production)

## 🔄 Nâng cấp Node.js (nếu cần):

### Trên Ubuntu/Debian:
```bash
# Cài Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra
node --version  # Nên là v18.x.x
```

### Hoặc dùng nvm:
```bash
# Cài nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Cài Node.js 18
nvm install 18
nvm use 18

# Kiểm tra
node --version
```

## ✅ Kết luận:

- ✅ Đã sửa code để tương thích với Node.js cũ
- ✅ Code hiện tại hoạt động với mọi version Node.js
- 💡 Khuyến nghị nâng cấp lên Node.js 18.x LTS để có performance tốt hơn


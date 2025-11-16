# 🔧 SỬA LỖI: Invalid login - Gmail Authentication Error

## ❌ Lỗi gặp phải:

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
535 5.7.8 https://support.google.com/mail/?p=BadCredentials
```

## 🔍 Nguyên nhân:

Lỗi này xảy ra khi:
1. ❌ Đang dùng password Gmail thường (không được phép)
2. ❌ App Password không đúng hoặc đã bị xóa
3. ❌ Chưa bật 2-Step Verification
4. ❌ App Password có dấu cách (cần bỏ dấu cách)

---

## ✅ GIẢI PHÁP: TẠO APP PASSWORD ĐÚNG CÁCH

### Bước 1: Kiểm tra 2-Step Verification đã bật chưa

1. Truy cập: https://myaccount.google.com/security
2. Đăng nhập vào tài khoản Gmail
3. Tìm mục **"2-Step Verification"**
4. **PHẢI BẬT** trước khi tạo App Password!

**⚠️ QUAN TRỌNG:** Nếu chưa bật 2-Step Verification:
- Click **"Get started"** hoặc **"Turn on"**
- Làm theo hướng dẫn để bật 2-Step Verification
- Có thể cần xác minh số điện thoại hoặc email phụ

---

### Bước 2: Tạo App Password MỚI

1. Truy cập: https://myaccount.google.com/apppasswords
   - Hoặc vào: **Google Account** → **Security** → **2-Step Verification** → **App passwords**

2. Nếu không thấy mục App passwords:
   - Kiểm tra lại 2-Step Verification đã bật chưa
   - Phải bật 2-Step Verification trước!

3. Tạo App Password:
   - **Select app**: Chọn **"Mail"**
   - **Select device**: Chọn **"Other (Custom name)"**
   - Nhập tên: **"HAS Cinema Server"** hoặc tên bạn muốn
   - Click **"Generate"**

4. **Copy password ngay lập tức!**
   - Password có 16 ký tự
   - Format: `abcd efgh ijkl mnop` (có dấu cách) hoặc `abcdefghijklmnop`
   - **CHỈ HIỂN THỊ 1 LẦN!**

---

### Bước 3: Cập nhật config.env

Mở file `config.env` và cập nhật:

```bash
cd ~/projects/cinemas-has/server
nano config.env
```

**Cấu hình đúng:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=cinema.has2208@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=cinema.has2208@gmail.com
```

**Lưu ý:**
- `SMTP_PASS`: **Bỏ dấu cách** trong App Password (16 ký tự liền nhau)
- Ví dụ: `abcd efgh ijkl mnop` → `abcdefghijklmnop`
- `SMTP_USER`: Email Gmail của bạn (không cần @gmail.com nếu đúng domain)

---

### Bước 4: Test lại

```bash
cd ~/projects/cinemas-has/server
node test-email.js
```

---

## 🔍 CÁC LỖI THƯỜNG GẶP VÀ CÁCH SỬA

### 1. ❌ "App passwords isn't available"

**Nguyên nhân:** Chưa bật 2-Step Verification

**Giải pháp:**
1. Bật 2-Step Verification: https://myaccount.google.com/security
2. Sau đó mới tạo App Password: https://myaccount.google.com/apppasswords

---

### 2. ❌ "Invalid login" hoặc "Bad credentials"

**Nguyên nhân có thể:**

#### a) Đang dùng password thường
```env
# ❌ SAI:
SMTP_PASS=your-gmail-password

# ✅ ĐÚNG:
SMTP_PASS=abcdefghijklmnop  # App Password (16 ký tự, không có dấu cách)
```

#### b) App Password có dấu cách
```env
# ❌ SAI:
SMTP_PASS=abcd efgh ijkl mnop  # Có dấu cách

# ✅ ĐÚNG:
SMTP_PASS=abcdefghijklmnop  # Bỏ dấu cách
```

#### c) App Password không đúng hoặc đã xóa
- Tạo App Password MỚI
- Copy chính xác 16 ký tự

#### d) Email không đúng
```env
# ❌ SAI:
SMTP_USER=cinema.has2208@gmail.com  # Nếu có @gmail.com có thể gây lỗi

# ✅ ĐÚNG:
SMTP_USER=cinema.has2208@gmail.com  # Hoặc chỉ email, không cần @gmail.com
```

---

### 3. ❌ "Less secure app access"

**Nguyên nhân:** Gmail đã tắt tính năng này

**Giải pháp:** PHẢI dùng App Password, không dùng password thường

---

## ✅ CHECKLIST KIỂM TRA

### Trước khi test:
- [ ] Đã bật 2-Step Verification
- [ ] Đã tạo App Password mới
- [ ] App Password có đúng 16 ký tự
- [ ] Đã bỏ dấu cách trong App Password (nếu có)
- [ ] Đã cập nhật `SMTP_PASS` trong `config.env`
- [ ] `SMTP_USER` đúng email Gmail
- [ ] Đã lưu file `config.env`

### Test:
- [ ] Chạy `node test-email.js`
- [ ] Kiểm tra email trong inbox (hoặc spam)
- [ ] Kiểm tra logs có lỗi không

---

## 🔧 QUY TRÌNH ĐÚNG ĐỂ TẠO APP PASSWORD

### 1. Bật 2-Step Verification
```
https://myaccount.google.com/security
→ 2-Step Verification
→ Turn on
```

### 2. Tạo App Password
```
https://myaccount.google.com/apppasswords
→ Select app: Mail
→ Select device: Other (Custom name)
→ Name: HAS Cinema Server
→ Generate
→ COPY PASSWORD (16 ký tự)
```

### 3. Cập nhật config.env
```bash
nano ~/projects/cinemas-has/server/config.env
```

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=cinema.has2208@gmail.com
SMTP_PASS=abcdefghijklmnop  # App Password (16 ký tự, KHÔNG có dấu cách)
SMTP_FROM=cinema.has2208@gmail.com
```

### 4. Test
```bash
cd ~/projects/cinemas-has/server
node test-email.js
```

---

## 📋 VÍ DỤ CẤU HÌNH ĐÚNG

### File config.env:
```env
# Email Configuration - Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=cinema.has2208@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=cinema.has2208@gmail.com
```

### App Password:
- **Định dạng:** 16 ký tự, không có dấu cách
- **Ví dụ:** `abcdefghijklmnop`
- **KHÔNG PHẢI:** `abcd efgh ijkl mnop` (có dấu cách)

---

## 🆘 NẾU VẪN KHÔNG WORK

### 1. Xóa App Password cũ và tạo mới

1. Truy cập: https://myaccount.google.com/apppasswords
2. Xóa App Password cũ (nếu có)
3. Tạo App Password MỚI
4. Copy password mới (16 ký tự)
5. Cập nhật `config.env` với password mới

### 2. Kiểm tra email có đúng không

```bash
# Test email format
echo "cinema.has2208@gmail.com" | grep -E "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
```

### 3. Test với email khác

- Tạo Gmail mới
- Làm lại quy trình từ đầu

### 4. Kiểm tra firewall

```bash
# Test kết nối SMTP
telnet smtp.gmail.com 587
```

Nếu không kết nối được, firewall có thể đang chặn port 587.

---

## ✅ KẾT LUẬN

**Nguyên nhân chính:** Có thể đang dùng password thường hoặc App Password không đúng.

**Giải pháp:**
1. ✅ Bật 2-Step Verification
2. ✅ Tạo App Password MỚI
3. ✅ Bỏ dấu cách trong App Password
4. ✅ Cập nhật `config.env`
5. ✅ Test lại

**Chúc bạn sửa thành công! 🎉**


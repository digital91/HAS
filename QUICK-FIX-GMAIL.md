# ⚡ QUICK FIX: Gmail Authentication Error

## ❌ Lỗi: Invalid login (535-5.7.8)

**Nguyên nhân:** Đang dùng password thường hoặc App Password không đúng

---

## ✅ GIẢI PHÁP NHANH (3 BƯỚC)

### Bước 1: Tạo App Password mới

1. Truy cập: https://myaccount.google.com/apppasswords
2. Chọn **App**: Mail
3. Chọn **Device**: Other (Custom name)
4. Nhập tên: **HAS Cinema**
5. Click **Generate**
6. **Copy password ngay** (16 ký tự, chỉ hiển thị 1 lần!)

**⚠️ QUAN TRỌNG:**
- Phải bật **2-Step Verification** trước!
- Bật tại: https://myaccount.google.com/security

---

### Bước 2: Cập nhật config.env

```bash
cd ~/projects/cinemas-has/server
nano config.env
```

**Cập nhật:**
```env
SMTP_PASS=abcdefghijklmnop
```

**Lưu ý:**
- Thay `abcdefghijklmnop` bằng App Password THẬT của bạn
- **Bỏ dấu cách** nếu có (16 ký tự liền nhau)
- **KHÔNG** dùng password Gmail thường

---

### Bước 3: Test lại

```bash
node test-email.js
```

---

## 🔍 KIỂM TRA NHANH

### Checklist:
- [ ] Đã bật 2-Step Verification
- [ ] Đã tạo App Password mới (16 ký tự)
- [ ] Đã bỏ dấu cách trong App Password
- [ ] Đã cập nhật `SMTP_PASS` trong config.env
- [ ] Đã lưu file config.env

---

## ⚠️ LƯU Ý QUAN TRỌNG

### ❌ SAI:
```env
SMTP_PASS=your-gmail-password  # Password thường
SMTP_PASS=abcd efgh ijkl mnop  # Có dấu cách
```

### ✅ ĐÚNG:
```env
SMTP_PASS=abcdefghijklmnop  # App Password (16 ký tự, không có dấu cách)
```

---

## 🆘 NẾU VẪN KHÔNG WORK

1. **Xóa App Password cũ và tạo mới:**
   - https://myaccount.google.com/apppasswords
   - Xóa App Password cũ
   - Tạo App Password MỚI
   - Copy password mới

2. **Kiểm tra 2-Step Verification đã bật chưa:**
   - https://myaccount.google.com/security
   - Phải bật trước khi tạo App Password

3. **Kiểm tra email đúng chưa:**
   ```env
   SMTP_USER=cinema.has2208@gmail.com  # Đúng email Gmail
   ```

---

**Làm theo 3 bước trên là sẽ fix được! ✅**


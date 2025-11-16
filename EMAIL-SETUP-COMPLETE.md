# ✅ EMAIL SERVICE ĐÃ ĐƯỢC CẤU HÌNH THÀNH CÔNG!

## 🎉 Chúc mừng!

Email service của bạn đã hoạt động và sẵn sàng sử dụng!

---

## 📋 TÓM TẮT NHỮNG GÌ ĐÃ LÀM

### ✅ Đã hoàn thành:
1. ✅ Cài đặt nodemailer
2. ✅ Tạo module email (`server/utils/email.js`)
3. ✅ Cấu hình SMTP với Gmail
4. ✅ Tạo App Password cho Gmail
5. ✅ Test email thành công
6. ✅ Nhận được email test

---

## 🔧 CẤU HÌNH HIỆN TẠI

### SMTP Configuration:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=cinema.has2208@gmail.com
SMTP_PASS=your-app-password (đã cấu hình)
SMTP_FROM=cinema.has2208@gmail.com
```

### Email Service:
- ✅ Gửi email đơn giản
- ✅ Gửi email xác nhận đăng ký
- ✅ Gửi email đặt lại mật khẩu
- ✅ Gửi email xác nhận đặt vé

---

## 📚 CÁCH SỬ DỤNG TRONG DỰ ÁN

### 1. Import module email

```javascript
const { 
  sendEmail, 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendBookingConfirmationEmail 
} = require('./utils/email');
```

### 2. Gửi email đơn giản

```javascript
const { sendEmail } = require('./utils/email');

const result = await sendEmail({
  to: 'customer@example.com',
  subject: 'Chủ đề email',
  text: 'Nội dung email dạng text',
  html: '<h1>Nội dung email dạng HTML</h1>'
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Failed to send email:', result.error);
}
```

### 3. Gửi email xác nhận booking

Ví dụ trong `server/routes/bookings.js`:

```javascript
const { sendBookingConfirmationEmail } = require('../utils/email');

// Trong route POST /api/bookings
router.post('/', authenticateToken, async (req, res) => {
  // ... code tạo booking ...
  
  // Gửi email xác nhận (không fail request nếu email không gửi được)
  try {
    await sendBookingConfirmationEmail(booking.customer.email, booking);
    console.log('Booking confirmation email sent');
  } catch (error) {
    console.error('Failed to send booking email:', error);
    // Không fail request, chỉ log error
  }
  
  res.status(201).json(booking);
});
```

### 4. Gửi email đặt lại mật khẩu

Ví dụ trong `server/routes/auth.js`:

```javascript
const { sendPasswordResetEmail } = require('../utils/email');
const crypto = require('crypto');

// Route POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // Tìm user
  const user = await User.findOne({ email });
  if (!user) {
    // Không tiết lộ user có tồn tại không
    return res.json({ message: 'If email exists, reset link sent' });
  }
  
  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút
  await user.save();
  
  // Gửi email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
    res.json({ message: 'If email exists, reset link sent' });
  } catch (error) {
    console.error('Failed to send reset email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});
```

### 5. Gửi email xác nhận đăng ký

Ví dụ trong `server/routes/auth.js`:

```javascript
const { sendVerificationEmail } = require('../utils/email');

// Trong route POST /api/auth/register
router.post('/register', async (req, res) => {
  // ... code tạo user ...
  
  // Tạo verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  user.emailVerified = false;
  await user.save();
  
  // Gửi email xác nhận (không fail request nếu email không gửi được)
  try {
    await sendVerificationEmail(user.email, verificationToken);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Không fail request
  }
  
  res.status(201).json({
    message: 'User created successfully. Please verify your email.',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});
```

---

## 📧 CÁC HÀM EMAIL CÓ SẴN

### 1. `sendEmail(options)`
Gửi email đơn giản

**Parameters:**
```javascript
{
  to: 'email@example.com',      // Email người nhận
  subject: 'Chủ đề',            // Chủ đề email
  text: 'Nội dung text',        // Nội dung text (optional)
  html: '<h1>HTML</h1>'         // Nội dung HTML (optional)
}
```

**Returns:**
```javascript
{
  success: true,
  messageId: 'message-id'
}
// hoặc
{
  success: false,
  error: 'error message'
}
```

---

### 2. `sendVerificationEmail(email, token)`
Gửi email xác nhận đăng ký

**Parameters:**
- `email`: Email người nhận
- `token`: Verification token

**Email template:** Có sẵn HTML template đẹp

---

### 3. `sendPasswordResetEmail(email, token)`
Gửi email đặt lại mật khẩu

**Parameters:**
- `email`: Email người nhận
- `token`: Reset password token

**Email template:** Có sẵn HTML template với warning

---

### 4. `sendBookingConfirmationEmail(email, booking)`
Gửi email xác nhận đặt vé

**Parameters:**
- `email`: Email người nhận
- `booking`: Booking object (phải có customer, bookingCode, showtime, seats, totalPrice)

**Email template:** Có sẵn HTML template với booking details

---

## 🔐 BẢO MẬT

### ✅ Best Practices:
1. ✅ **Không commit `config.env` lên Git**
   - Đảm bảo `.gitignore` có `config.env`
   - Đảm bảo `SMTP_PASS` không bị lộ

2. ✅ **Không fail request nếu email không gửi được**
   - Dùng try-catch
   - Chỉ log error, không throw

3. ✅ **Rate limiting cho email**
   - Giới hạn số email gửi trong 1 khoảng thời gian
   - Tránh spam

4. ✅ **Email verification**
   - Xác minh email khi đăng ký
   - Tránh email giả

---

## 📊 MONITORING

### Logs:
Email service sẽ log:
- ✅ Success: `Email sent: message-id`
- ❌ Error: `Email error: error message`
- ⚠️ Warning: `SMTP not configured`

### Kiểm tra logs:
```bash
# Xem logs real-time
pm2 logs has-cinema-server | grep -i email

# Xem logs trong file
tail -f ~/projects/cinemas-has/server/logs/combined.log | grep -i email
```

---

## 🎯 CÁC BƯỚC TIẾP THEO

### 1. Tích hợp vào routes cần thiết:
- [ ] Gửi email khi booking thành công
- [ ] Gửi email xác nhận đăng ký
- [ ] Gửi email đặt lại mật khẩu
- [ ] Gửi email thông báo (nếu cần)

### 2. Cải thiện email templates:
- [ ] Thêm logo/branding
- [ ] Cải thiện responsive design
- [ ] Thêm footer với unsubscribe link

### 3. Email marketing (tùy chọn):
- [ ] Newsletter
- [ ] Promotions
- [ ] Movie recommendations

---

## 🚀 READY TO USE!

Email service đã sẵn sàng sử dụng trong dự án của bạn!

**Chúc bạn phát triển dự án thành công! 🎉**


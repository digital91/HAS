# 📧 HƯỚNG DẪN CẤU HÌNH EMAIL (SMTP) CHO HAS CINEMA

## 🎯 Tổng quan

Hướng dẫn này sẽ giúp bạn cấu hình SMTP để gửi email từ ứng dụng HAS Cinema, có thể dùng cho:
- ✅ Xác nhận đăng ký (email verification)
- ✅ Đặt lại mật khẩu (password reset)
- ✅ Gửi vé xem phim qua email
- ✅ Thông báo booking confirmation
- ✅ Email marketing (nếu cần)

---

## 📋 CHỌN DỊCH VỤ SMTP

### Option 1: Gmail (Miễn phí - Khuyến nghị cho bắt đầu)
- ✅ Miễn phí
- ✅ Dễ cấu hình
- ✅ Hỗ trợ tốt
- ⚠️ Giới hạn: 500 emails/ngày

### Option 2: SendGrid (Miễn phí tier)
- ✅ Miễn phí: 100 emails/ngày
- ✅ API dễ sử dụng
- ✅ Tốt cho production

### Option 3: Mailgun (Miễn phí tier)
- ✅ Miễn phí: 5,000 emails/tháng
- ✅ Tốt cho production

### Option 4: AWS SES (Trả phí theo sử dụng)
- ✅ Rất rẻ ($0.10 cho 1,000 emails)
- ✅ Scale tốt
- ⚠️ Cần AWS account

---

## 🔧 BƯỚC 1: CẤU HÌNH GMAIL (Khuyến nghị cho bắt đầu)

### 1.1. Bật 2-Step Verification

1. Truy cập: https://myaccount.google.com/security
2. Đăng nhập vào tài khoản Google của bạn
3. Tìm mục **"2-Step Verification"**
4. Nhấn **"Get started"** hoặc **"Turn on"**
5. Làm theo hướng dẫn để bật 2-Step Verification

**Lưu ý:** Bạn PHẢI bật 2-Step Verification trước khi tạo App Password!

### 1.2. Tạo App Password

1. Truy cập: https://myaccount.google.com/apppasswords
2. Hoặc vào: **Google Account** → **Security** → **2-Step Verification** → **App passwords**
3. Chọn **App** → Chọn **"Mail"**
4. Chọn **Device** → Chọn **"Other (Custom name)"**
5. Nhập tên: **"HAS Cinema"** hoặc tên bạn muốn
6. Nhấn **"Generate"**
7. **Copy password** (16 ký tự, có dấu cách) - Ví dụ: `abcd efgh ijkl mnop`

**⚠️ QUAN TRỌNG:** 
- App Password chỉ hiển thị 1 lần!
- Copy và lưu lại ngay!
- Format: `abcd efgh ijkl mnop` (có dấu cách)
- Khi dùng trong config, bạn có thể bỏ dấu cách: `abcdefghijklmnop`

### 1.3. Cấu hình trong config.env

Mở file `HAS/server/config.env` và cập nhật:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=noreply@yourdomain.com
```

**Ví dụ:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=has.cinema@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=has.cinema@gmail.com
```

**Lưu ý:**
- `SMTP_USER`: Email Gmail của bạn
- `SMTP_PASS`: App Password (16 ký tự, có thể bỏ dấu cách)
- `SMTP_FROM`: Email hiển thị là người gửi (thường là SMTP_USER)
- `SMTP_PORT`: 587 (TLS) hoặc 465 (SSL)
- `SMTP_SECURE`: false cho port 587, true cho port 465

---

## 🔧 BƯỚC 2: CẤU HÌNH CÁC DỊCH VỤ KHÁC

### 2.1. SendGrid

1. Đăng ký: https://sendgrid.com
2. Verify email
3. Tạo API Key: **Settings** → **API Keys** → **Create API Key**
4. Copy API Key

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

### 2.2. Mailgun

1. Đăng ký: https://www.mailgun.com
2. Verify domain
3. Lấy SMTP credentials: **Sending** → **Domain Settings** → **SMTP credentials**

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your-mailgun-password
SMTP_FROM=noreply@yourdomain.com
```

### 2.3. Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

### 2.4. Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yahoo.com
```

---

## 📦 BƯỚC 3: CÀI ĐẶT NODEMAILER

### 3.1. Cài đặt package

```bash
cd HAS/server
npm install nodemailer
```

### 3.2. Tạo module email

Tạo file `HAS/server/utils/email.js`:

```javascript
const nodemailer = require('nodemailer');

// Tạo transporter từ SMTP config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true cho port 465, false cho port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Tăng timeout cho connection
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify connection
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// Hàm gửi email đơn giản
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi email xác nhận đăng ký
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HAS Cinema</h1>
        </div>
        <div class="content">
          <h2>Xác nhận đăng ký tài khoản</h2>
          <p>Xin chào,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại HAS Cinema!</p>
          <p>Vui lòng click vào nút bên dưới để xác nhận email của bạn:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Xác nhận Email</a>
          </p>
          <p>Hoặc copy link sau vào trình duyệt:</p>
          <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
          <p><strong>Lưu ý:</strong> Link này sẽ hết hạn sau 24 giờ.</p>
        </div>
        <div class="footer">
          <p>© 2024 HAS Cinema. All rights reserved.</p>
          <p>Email này được gửi tự động, vui lòng không reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    HAS Cinema - Xác nhận đăng ký
    
    Xin chào,
    
    Cảm ơn bạn đã đăng ký tài khoản tại HAS Cinema!
    
    Vui lòng click vào link sau để xác nhận email:
    ${verificationUrl}
    
    Lưu ý: Link này sẽ hết hạn sau 24 giờ.
    
    © 2024 HAS Cinema
  `;

  return await sendEmail({
    to: email,
    subject: 'Xác nhận đăng ký - HAS Cinema',
    text,
    html
  });
};

// Hàm gửi email đặt lại mật khẩu
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HAS Cinema</h1>
        </div>
        <div class="content">
          <h2>Đặt lại mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Click vào nút bên dưới để đặt lại mật khẩu:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
          </p>
          <p>Hoặc copy link sau vào trình duyệt:</p>
          <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
          <div class="warning">
            <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
            <ul>
              <li>Link này chỉ có hiệu lực trong 1 giờ</li>
              <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
              <li>Mật khẩu của bạn sẽ không thay đổi cho đến khi bạn tạo mật khẩu mới</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>© 2024 HAS Cinema. All rights reserved.</p>
          <p>Email này được gửi tự động, vui lòng không reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    HAS Cinema - Đặt lại mật khẩu
    
    Xin chào,
    
    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
    
    Click vào link sau để đặt lại mật khẩu:
    ${resetUrl}
    
    Lưu ý: Link này chỉ có hiệu lực trong 1 giờ.
    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
    
    © 2024 HAS Cinema
  `;

  return await sendEmail({
    to: email,
    subject: 'Đặt lại mật khẩu - HAS Cinema',
    text,
    html
  });
};

// Hàm gửi email booking confirmation
const sendBookingConfirmationEmail = async (email, booking) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .code { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; padding: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Đặt vé thành công!</h1>
        </div>
        <div class="content">
          <h2>HAS Cinema - Xác nhận đặt vé</h2>
          <p>Xin chào ${booking.customer.name},</p>
          <p>Cảm ơn bạn đã đặt vé tại HAS Cinema!</p>
          
          <div class="booking-info">
            <p><strong>Mã đặt vé:</strong></p>
            <div class="code">${booking.bookingCode}</div>
            
            <p><strong>Thông tin đặt vé:</strong></p>
            <ul>
              <li>Phim: ${booking.showtime?.movie?.title || 'N/A'}</li>
              <li>Ghế: ${booking.seats?.map(s => s.seatNumber).join(', ') || 'N/A'}</li>
              <li>Tổng tiền: ${booking.totalPrice?.toLocaleString('vi-VN')} VNĐ</li>
              <li>Trạng thái: ${booking.status || 'pending'}</li>
            </ul>
          </div>
          
          <p>Vui lòng mang mã đặt vé này đến rạp để nhận vé.</p>
          <p>Chúc bạn xem phim vui vẻ!</p>
        </div>
        <div class="footer">
          <p>© 2024 HAS Cinema. All rights reserved.</p>
          <p>Email này được gửi tự động, vui lòng không reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    HAS Cinema - Xác nhận đặt vé
    
    Xin chào ${booking.customer.name},
    
    Cảm ơn bạn đã đặt vé tại HAS Cinema!
    
    Mã đặt vé: ${booking.bookingCode}
    
    Thông tin đặt vé:
    - Phim: ${booking.showtime?.movie?.title || 'N/A'}
    - Ghế: ${booking.seats?.map(s => s.seatNumber).join(', ') || 'N/A'}
    - Tổng tiền: ${booking.totalPrice?.toLocaleString('vi-VN')} VNĐ
    
    Vui lòng mang mã đặt vé này đến rạp để nhận vé.
    
    Chúc bạn xem phim vui vẻ!
    
    © 2024 HAS Cinema
  `;

  return await sendEmail({
    to: email,
    subject: `Đặt vé thành công - Mã: ${booking.bookingCode} - HAS Cinema`,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail
};
```

---

## 🔌 BƯỚC 4: TÍCH HỢP VÀO DỰ ÁN

### 4.1. Test email service

Tạo file `HAS/server/test-email.js`:

```javascript
require('dotenv').config({ path: './config.env' });
const { sendEmail } = require('./utils/email');

async function testEmail() {
  console.log('Testing email service...');
  
  const result = await sendEmail({
    to: process.env.SMTP_USER, // Gửi email cho chính mình để test
    subject: 'Test Email từ HAS Cinema',
    text: 'Đây là email test từ HAS Cinema server.',
    html: '<h1>Test Email</h1><p>Đây là email test từ HAS Cinema server.</p>'
  });
  
  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } else {
    console.error('❌ Failed to send email:', result.error);
  }
}

testEmail();
```

Chạy test:
```bash
cd HAS/server
node test-email.js
```

### 4.2. Sử dụng trong routes

Ví dụ: Gửi email khi booking thành công

```javascript
// server/routes/bookings.js
const { sendBookingConfirmationEmail } = require('../utils/email');

// Trong route POST /api/bookings
router.post('/', authenticateToken, async (req, res) => {
  // ... code tạo booking ...
  
  // Gửi email xác nhận
  try {
    await sendBookingConfirmationEmail(booking.customer.email, booking);
  } catch (error) {
    console.error('Failed to send booking email:', error);
    // Không fail request nếu email không gửi được
  }
  
  res.status(201).json(booking);
});
```

---

## 🧪 BƯỚC 5: TEST VÀ TROUBLESHOOTING

### Test cấu hình SMTP

```bash
# Test với script đã tạo
cd HAS/server
node test-email.js
```

### Các lỗi thường gặp:

#### 1. **"Invalid login" hoặc "Authentication failed"**
- ✅ Kiểm tra SMTP_USER và SMTP_PASS
- ✅ Với Gmail: Đảm bảo dùng App Password, không dùng password thường
- ✅ Với Gmail: Đảm bảo đã bật 2-Step Verification

#### 2. **"Connection timeout"**
- ✅ Kiểm tra firewall có chặn port 587/465 không
- ✅ Kiểm tra SMTP_HOST có đúng không
- ✅ Kiểm tra internet connection

#### 3. **"Self signed certificate"**
- ✅ Thêm option `tls: { rejectUnauthorized: false }` trong transporter (chỉ dùng cho development)

#### 4. **Gmail: "Less secure app access"**
- ✅ Gmail đã tắt tính năng này
- ✅ PHẢI dùng App Password thay vì password thường

---

## ✅ CHECKLIST CẤU HÌNH

- [ ] Đã cài đặt nodemailer
- [ ] Đã tạo module email (utils/email.js)
- [ ] Đã cấu hình SMTP trong config.env
- [ ] Đã test gửi email thành công
- [ ] Đã tích hợp vào routes cần thiết

---

## 📚 TÀI LIỆU THAM KHẢO

- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Mailgun Documentation](https://documentation.mailgun.com/)

---

**Chúc bạn cấu hình email thành công! 📧✅**


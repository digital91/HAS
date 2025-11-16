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
  // Kiểm tra nếu SMTP chưa được cấu hình
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP not configured. Email will not be sent.');
    return { success: false, error: 'SMTP not configured' };
  }

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
              <li>Phim: ${(booking.showtime && booking.showtime.movie && booking.showtime.movie.title) || 'N/A'}</li>
              <li>Ghế: ${(booking.seats && Array.isArray(booking.seats) && booking.seats.map(s => s.seatNumber).join(', ')) || 'N/A'}</li>
              <li>Tổng tiền: ${(booking.totalPrice && booking.totalPrice.toLocaleString('vi-VN')) || '0'} VNĐ</li>
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
    - Phim: ${(booking.showtime && booking.showtime.movie && booking.showtime.movie.title) || 'N/A'}
    - Ghế: ${(booking.seats && Array.isArray(booking.seats) && booking.seats.map(s => s.seatNumber).join(', ')) || 'N/A'}
    - Tổng tiền: ${(booking.totalPrice && booking.totalPrice.toLocaleString('vi-VN')) || '0'} VNĐ
    
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


/**
 * Test Email Service
 * 
 * Usage: node test-email.js
 * 
 * This script tests the email service configuration
 */

require('dotenv').config({ path: './config.env' });
const { sendEmail } = require('./utils/email');

async function testEmail() {
  console.log('🧪 Testing email service...');
  console.log('');
  
  // Kiểm tra config
  console.log('📋 SMTP Configuration:');
  console.log(`  Host: ${process.env.SMTP_HOST || 'Not set'}`);
  console.log(`  Port: ${process.env.SMTP_PORT || 'Not set'}`);
  console.log(`  User: ${process.env.SMTP_USER || 'Not set'}`);
  console.log(`  Pass: ${process.env.SMTP_PASS ? '***' : 'Not set'}`);
  console.log('');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP_USER and SMTP_PASS must be set in config.env');
    console.log('');
    console.log('Please add these to your config.env:');
    console.log('  SMTP_HOST=smtp.gmail.com');
    console.log('  SMTP_PORT=587');
    console.log('  SMTP_USER=your-email@gmail.com');
    console.log('  SMTP_PASS=your-app-password');
    process.exit(1);
  }
  
  const testEmailAddress = process.env.SMTP_USER; // Gửi email cho chính mình để test
  
  console.log(`📧 Sending test email to: ${testEmailAddress}`);
  console.log('');
  
  const result = await sendEmail({
    to: testEmailAddress,
    subject: 'Test Email từ HAS Cinema',
    text: `
      Đây là email test từ HAS Cinema server.
      
      Nếu bạn nhận được email này, nghĩa là SMTP đã được cấu hình thành công!
      
      Thời gian: ${new Date().toLocaleString('vi-VN')}
      
      © 2024 HAS Cinema
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Test Email - HAS Cinema</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2>🎉 SMTP Cấu hình thành công!</h2>
              <p>Đây là email test từ HAS Cinema server.</p>
              <p>Nếu bạn nhận được email này, nghĩa là SMTP đã được cấu hình đúng!</p>
            </div>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
            <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</p>
          </div>
          <div class="footer">
            <p>© 2024 HAS Cinema. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
  
  console.log('');
  
  if (result.success) {
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log('');
    console.log(`📬 Please check your inbox at: ${testEmailAddress}`);
    console.log('   (Check spam folder if not found in inbox)');
  } else {
    console.error('❌ Failed to send email:');
    console.error(`   Error: ${result.error}`);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check SMTP credentials in config.env');
    console.log('   2. For Gmail: Make sure you use App Password, not regular password');
    console.log('   3. For Gmail: Make sure 2-Step Verification is enabled');
    console.log('   4. Check firewall settings');
    console.log('   5. Check internet connection');
    process.exit(1);
  }
}

// Run test
testEmail().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});


// check-email-service.js
// Script to test if email service initializes correctly with current .env configuration

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Initialize environment variables
dotenv.config();

console.log('Email Service Configuration Check');
console.log('================================');

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check environment variables
console.log('\n[1] Checking environment variables:');
console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST || '(not set)'}`);
console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || '(not set)'}`);
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || '(not set)'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '(set)' : '(not set)'}`);

// Create test transporter
async function testEmailService() {
  console.log('\n[2] Testing email service initialization:');
  
  let testAccount;
  let transporter;
  
  // If email settings are not configured, use Ethereal
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    try {
      console.log('- No email configuration found, creating Ethereal test account...');
      testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('- ✅ Test account created successfully!');
      console.log(`- Ethereal User: ${testAccount.user}`);
      console.log(`- Ethereal Pass: ${testAccount.pass}`);
    } catch (error) {
      console.error('- ❌ Failed to create test account:', error.message);
      return false;
    }
  } else {
    // Use configured email settings
    console.log('- Using configured email settings from .env');
    
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // Verify connection
  try {
    console.log('- Verifying email service connection...');
    await transporter.verify();
    console.log('- ✅ Email service connection successful!');
    
    // Send test email if using Ethereal
    if (testAccount) {
      console.log('\n[3] Sending test email:');
      const info = await transporter.sendMail({
        from: '"Test Sender" <test@example.com>',
        to: testAccount.user,
        subject: 'Test Email from Online Auction',
        text: 'If you can see this, email service is working correctly!',
        html: '<b>If you can see this, email service is working correctly!</b>'
      });
      
      console.log('- ✅ Test email sent successfully!');
      console.log(`- Message ID: ${info.messageId}`);
      console.log(`- Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log('- You can view the test email at the preview URL above');
    }
    
    return true;
  } catch (error) {
    console.error('- ❌ Email service verification failed:', error.message);
    
    // Provide advice for common errors
    if (error.code === 'ECONNREFUSED') {
      console.log('\n[!] Connection refused. Possible causes:');
      console.log('- SMTP server is not reachable at the provided host/port');
      console.log('- Firewall is blocking the connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n[!] Connection timed out. Possible causes:');
      console.log('- SMTP server is not reachable');
      console.log('- Network issues');
    } else if (error.code === 'EAUTH') {
      console.log('\n[!] Authentication failed. Possible causes:');
      console.log('- Incorrect username or password');
      console.log('- Application-specific password may be required');
      console.log('- 2FA may be enabled on the email account');
    }
    
    return false;
  }
}

// Run the test
await testEmailService();

console.log('\n[4] Conclusion:');
console.log('If you see any issues above, first try these solutions:');
console.log('1. For Gmail: Enable "Less secure app access" or create an app password');
console.log('2. For other providers: Check SMTP settings and credentials');
console.log('3. If all else fails, let Ethereal handle test emails in development mode');
console.log('\nThe code is designed to fall back to Ethereal if no email config is provided,');
console.log('so feel free to comment out the EMAIL_* variables in .env for development.'); 
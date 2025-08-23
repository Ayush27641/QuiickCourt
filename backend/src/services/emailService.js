const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, text, html = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        ...(html && { html })
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendBookingConfirmation(userEmail, bookingDetails) {
    const subject = 'Booking Confirmation - OdooHackathon';
    const text = `
      Dear ${bookingDetails.userName},
      
      Your booking has been confirmed!
      
      Booking Details:
      - Facility: ${bookingDetails.facilityName}
      - Date: ${bookingDetails.date}
      - Time: ${bookingDetails.time}
      - Amount: $${bookingDetails.amount}
      
      Thank you for choosing our service!
      
      Best regards,
      OdooHackathon Team
    `;

    return await this.sendEmail(userEmail, subject, text);
  }

  async sendBookingReminder(userEmail, bookingDetails) {
    const subject = 'Booking Reminder - OdooHackathon';
    const text = `
      Dear ${bookingDetails.userName},
      
      This is a reminder for your upcoming booking:
      
      - Facility: ${bookingDetails.facilityName}
      - Date: ${bookingDetails.date}
      - Time: ${bookingDetails.time}
      
      Please arrive 15 minutes before your scheduled time.
      
      Best regards,
      OdooHackathon Team
    `;

    return await this.sendEmail(userEmail, subject, text);
  }

  async sendRefundNotification(userEmail, refundDetails) {
    const subject = 'Refund Processed - OdooHackathon';
    const text = `
      Dear ${refundDetails.userName},
      
      Your refund has been processed successfully.
      
      Refund Details:
      - Amount: $${refundDetails.amount}
      - Booking ID: ${refundDetails.bookingId}
      - Processing Time: 3-5 business days
      
      Best regards,
      OdooHackathon Team
    `;

    return await this.sendEmail(userEmail, subject, text);
  }

  async sendVerificationEmail(userEmail, verificationCode) {
    const subject = 'Email Verification - OdooHackathon';
    const text = `
      Welcome to OdooHackathon!
      
      Please verify your email address using the code below:
      
      Verification Code: ${verificationCode}
      
      This code will expire in 10 minutes.
      
      Best regards,
      OdooHackathon Team
    `;

    return await this.sendEmail(userEmail, subject, text);
  }
}

module.exports = new EmailService();

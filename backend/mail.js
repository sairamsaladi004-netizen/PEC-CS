import nodemailer from 'nodemailer';

// Uses SMTP configuration from environment variables
// To test locally, you can use Ethereal Email (https://ethereal.email/)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Sends an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 * @param {string} html - Email body (HTML)
 */
export async function sendMail(to, subject, text, html) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[Mail Service] SMTP credentials not fully configured. Email would have been sent to ${to} with subject: ${subject}`);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: '"Pragati University" <noreply@pragati-uni.edu>', // sender address
      to,
      subject,
      text,
      html: html || text
    });
    console.log("[Mail Service] Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("[Mail Service] Failed to send email:", error);
    return false;
  }
}

/**
 * Sends an OTP email for account verification
 */
export async function sendOtpEmail(to, otpCode) {
  const subject = "Verification Code for Pragati University CampusTech";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Pragati University CampusTech</h2>
      <p>Hello,</p>
      <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your institutional email address:</p>
      <div style="background-color: #f3f4f6; padding: 16px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 8px; margin: 24px 0;">
        ${otpCode}
      </div>
      <p>If you did not request this verification, you can safely ignore this email.</p>
      <p>Best regards,<br>Pragati University Administration</p>
    </div>
  `;
  return sendMail(to, subject, `Your OTP is: ${otpCode}`, html);
}

import nodemailer from 'nodemailer';

interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  const isSmtpConfigured =
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== 'smtp_user_placeholder' &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'smtp_pass_placeholder';

  if (!isSmtpConfigured) {
    console.log('=============== MOCK EMAIL SENT ===============');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    if (options.html) {
      console.log(`HTML Body: ${options.html}`);
    }
    console.log('==============================================');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Define mail options
  const mailOptions = {
    from: process.env.SMTP_FROM || 'SmartShop <noreply@smartshop.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send mail
  await transporter.sendMail(mailOptions);
};

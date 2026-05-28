import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

// 1. Initialize Nodemailer SMTP Transporter
const createTransporter = () => {
  const isProd = process.env.NODE_ENV === 'production';
  
  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    logger.warn('⚠️ SMTP credentials not found. Emails will be simulated and logged in server logs.');
    return {
      sendMail: async (mailOptions) => {
        logger.info(`✉️ SIMULATED EMAIL DISPATCH:
        To: ${mailOptions.to}
        Subject: ${mailOptions.subject}
        HTML Snippet: ${mailOptions.html.substring(0, 200)}...`);
        return { messageId: 'simulated-id-' + Math.random().toString() };
      }
    };
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Use SSL/TLS for 465
    auth: {
      user,
      pass
    }
  });
};

const transporter = createTransporter();

// 2. Generic Send Email Helper
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const from = process.env.SMTP_FROM || '"CloudERP Systems" <noreply@clouderp.com>';
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
    logger.info(`✉️ Email sent successfully: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error(`💥 Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

// ── HTML Templates Generator ─────────────────────────────────────

const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; color: #1f2937; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.05em; }
    .content { padding: 32px; line-height: 1.6; font-size: 15px; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .btn { display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background-color: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CloudERP Portal</h1>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; color: #111827; font-size: 18px;">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      This is an automated operational transmission from CloudERP. Please do not reply directly to this inbox.<br>
      © ${new Date().getFullYear()} CloudERP Corp. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

// 3. Welcome Email
export const sendWelcomeEmail = async (user) => {
  const htmlContent = baseTemplate(
    `Welcome aboard, ${user.name}!`,
    `<p>Your enterprise profile has been created successfully in CloudERP.</p>
     <p><strong>Security Role:</strong> ${user.role.toUpperCase()}</p>
     <p>You can now sign in to access your self-service profile dashboard, inspect your attendance registers, or submit leave requests.</p>
     <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Sign In to Dashboard</a></p>`
  );
  return sendEmail({ to: user.email, subject: 'Welcome to CloudERP', html: htmlContent });
};

// 4. Password Reset Email
export const sendPasswordResetEmail = async (user, resetUrl) => {
  const htmlContent = baseTemplate(
    'Password Reset Request',
    `<p>We received a request to reset your password. Click the button below to secure a new password credential:</p>
     <p><a href="${resetUrl}" class="btn">Reset Password</a></p>
     <p style="color: #6b7280; font-size: 13px;">This link is valid for 1 hour. If you did not request this, you can safely ignore this email.</p>`
  );
  return sendEmail({ to: user.email, subject: 'CloudERP Password Reset', html: htmlContent });
};

// 5. Payroll / Payslip Email
export const sendPayrollEmail = async (employee, salary) => {
  const htmlContent = baseTemplate(
    'Payslip Issued',
    `<p>Dear ${employee.name},</p>
     <p>Your payslip for <strong>${salary.month}</strong> has been generated and approved.</p>
     <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
       <tr style="border-bottom: 1px solid #e5e7eb; padding: 8px 0;"><td style="font-weight: 600;">Basic Salary:</td><td style="text-align: right;">₹${salary.basicSalary}</td></tr>
       <tr style="border-bottom: 1px solid #e5e7eb; padding: 8px 0;"><td style="font-weight: 600;">Allowances:</td><td style="text-align: right;">+₹${salary.allowances}</td></tr>
       <tr style="border-bottom: 1px solid #e5e7eb; padding: 8px 0;"><td style="font-weight: 600;">Deductions:</td><td style="text-align: right;">-₹${salary.deductions}</td></tr>
       <tr style="border-top: 2px solid #6366f1; padding: 12px 0; font-size: 16px; font-weight: 700;"><td>Net Amount Paid:</td><td style="text-align: right; color: #4f46e5;">₹${salary.netSalary}</td></tr>
     </table>
     <p>Payslips are also available for inspection under your employee profile portal history.</p>`
  );
  return sendEmail({ to: employee.email, subject: `CloudERP Payslip: ${salary.month}`, html: htmlContent });
};

// 6. Stockout Alert Email
export const sendStockAlertEmail = async (toEmail, product) => {
  const htmlContent = baseTemplate(
    'Low Stock Warning',
    `<p>An item in the inventory has crossed below the safety threshold limit:</p>
     <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0; border-radius: 4px;">
       <strong style="color: #991b1b; font-size: 15px;">${product.name} (SKU: ${product.sku})</strong><br>
       <span style="color: #ef4444; font-size: 14px;">Current Stock: ${product.stock} ${product.unit} (Threshold: ${product.minStock})</span>
     </div>
     <p>Please initiate procurement workflows with suppliers to reorder inventory units.</p>
     <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/inventory" class="btn">View Inventory Catalog</a></p>`
  );
  return sendEmail({ to: toEmail, subject: `⚠️ Low Stock Alert: ${product.name}`, html: htmlContent });
};

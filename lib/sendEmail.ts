import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for port 465, false for other ports (like 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

export async function sendOtpEmail(to: string, name: string, otp: string) {
  await transporter.sendMail({
    from: `"NexMart" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `${otp} is your NexMart verification code`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#2563eb;">Welcome to NexMart, ${name}!</h2>
        <p>Enter this code to verify your email address:</p>
        <div style="margin:20px 0;padding:16px 24px;background:#eff6ff;border-radius:8px;text-align:center;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb;">
            ${otp}
          </span>
        </div>
        <p style="color:#6b7280;font-size:13px;">
          This code expires in 10 minutes. If you didn't create this account, you can ignore this email.
        </p>
      </div>
    `,
  });
}
export async function sendContactMessage(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  await transporter.sendMail({
    from: `"NexMart Contact Form" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_FROM,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#2563eb;">New contact message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p style="white-space: pre-wrap; margin-top:16px;">${message}</p>
      </div>
    `,
  });
}

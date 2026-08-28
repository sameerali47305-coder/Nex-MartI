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

//send OTP
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

//contact message 
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

export async function sendSubscriptionConfirmation(email: string) {
  await transporter.sendMail({
    from: `"NexMart" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "You're subscribed to NexMart!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#2563eb;">You're in!</h2>
        <p>Thanks for subscribing to the NexMart newsletter. You'll be the
        first to hear about new arrivals, deals, and promotions.</p>
        <p style="color:#6b7280;font-size:13px;margin-top:16px;">
          Didn't sign up for this? You can safely ignore this email.
        </p>
      </div>
    `,
  });
}

//resend otp
export async function sendPasswordResetOtp(to: string, name: string, otp: string) {
  await transporter.sendMail({
    from: `"NexMart" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `${otp} is your NexMart password reset code`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#2563eb;">Password reset requested</h2>
        <p>Hi ${name}, enter this code to reset your password:</p>
        <div style="margin:20px 0;padding:16px 24px;background:#eff6ff;border-radius:8px;text-align:center;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb;">
            ${otp}
          </span>
        </div>
        <p style="color:#6b7280;font-size:13px;">
          This code expires in 10 minutes. If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
}

export async function sendPaymentSuccessEmail(
  to: string,
  name: string,
  orderId: string,
  total: number,
  pdfBuffer: Buffer
) {
  await transporter.sendMail({
    from: `"NexMart" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Payment Successful — Order #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#2563eb;">Thank you, ${name}!</h2>
        <p>Your payment of $${total.toFixed(2)} was successful and your order has been confirmed.</p>
        <p>Your invoice is attached to this email.</p>
        <p style="margin-top:16px;color:#6b7280;font-size:13px;">
          Order ID: ${orderId}
        </p>
      </div>
    `,
    attachments: [
      { filename: `invoice-${orderId}.pdf`, content: pdfBuffer },
    ],
  });
}

export async function sendOrderPlacedEmail(
  to: string,
  name: string,
  orderId: string,
  total: number,
  pdfBuffer: Buffer
) {
  await transporter.sendMail({
    from: `"NexMart" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Order Confirmed — Order #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#2563eb;">Thank you, ${name}!</h2>
        <p>Your order of $${total.toFixed(2)} has been placed and will be paid via Cash on Delivery.</p>
        <p>Your invoice is attached to this email.</p>
        <p style="margin-top:16px;color:#6b7280;font-size:13px;">
          Order ID: ${orderId}
        </p>
      </div>
    `,
    attachments: [
      { filename: `invoice-${orderId}.pdf`, content: pdfBuffer },
    ],
  });
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  name: string,
  orderId: string,
  status: string
) {
  await transporter.sendMail({
    from: `"NexMart" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Order #${orderId.slice(-8).toUpperCase()} is now ${status}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#2563eb;">Hi ${name},</h2>
        <p>Your order status has been updated to: <strong style="text-transform:capitalize;">${status}</strong></p>
        <p style="margin-top:16px;color:#6b7280;font-size:13px;">
          Order ID: ${orderId}
        </p>
      </div>
    `,
  });
}
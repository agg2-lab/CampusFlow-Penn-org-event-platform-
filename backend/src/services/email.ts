import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendMagicLinkEmail(
  email: string,
  token: string
): Promise<void> {
  const link = `${env.FRONTEND_URL}/api/auth/magic?token=${token}`;

  await transporter.sendMail({
    from: `"CampusFlow" <${env.SMTP_USER}>`,
    to: email,
    subject: "Sign in to CampusFlow",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e293b;">Sign in to CampusFlow</h2>
        <p style="color: #475569;">Click the button below to sign in. This link expires in 15 minutes.</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">
          Sign In
        </a>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendTicketEmail(
  email: string,
  eventTitle: string,
  qrDataUrl: string
): Promise<void> {
  await transporter.sendMail({
    from: `"CampusFlow" <${env.SMTP_USER}>`,
    to: email,
    subject: `Your ticket for ${eventTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1e293b;">You're going to ${eventTitle}!</h2>
        <p style="color: #475569;">Show this QR code at check-in:</p>
        <img src="${qrDataUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px;" />
        <p style="color: #94a3b8; font-size: 14px;">See you there!</p>
      </div>
    `,
  });
}

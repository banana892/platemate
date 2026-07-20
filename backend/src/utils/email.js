/**
 * email.js — Email Sending Utility (Resend)
 *
 * WHY RESEND?
 * Resend is a modern email API built for developers. It's simpler than
 * SendGrid/Mailgun, has great deliverability, and a generous free tier.
 *
 * DEVELOPMENT FALLBACK:
 * When RESEND_API_KEY is not set (typical in local dev), we log the email
 * content to the console instead of sending. This lets you test the full
 * auth flow without configuring an email provider.
 *
 * TEMPLATE APPROACH:
 * We use simple HTML templates inline. For a production app with many
 * email types, you'd move these to a template engine (Handlebars, MJML).
 * For Phase 4's three email types, inline is cleaner.
 */

import { Resend } from 'resend'
import { env } from '../config/env.js'
import logger from '../config/logger.js'

// Initialize Resend client only if API key is available
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

/**
 * Send an email using Resend, or log to console in development
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    // Development fallback — log email to console
    logger.info(
      {
        to,
        subject,
        // Strip HTML tags for readable console output
        body: html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      },
      '📧 Email (dev mode — not actually sent)'
    )
    return
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    })

    if (error) {
      logger.error({ error, to, subject }, 'Failed to send email via Resend')
      // Don't throw — email failure should not break auth flows
      return
    }

    logger.info({ emailId: data?.id, to, subject }, 'Email sent successfully')
  } catch (err) {
    logger.error({ err, to, subject }, 'Email sending threw an exception')
    // Swallow the error — email is best-effort, not critical path
  }
}

// ── Email Templates ──────────────────────────────────────────────────────────

/**
 * Send email verification link
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @param {string} token - Raw verification token
 */
export const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`

  await sendEmail({
    to,
    subject: 'Verify your PlateMate account',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">Welcome to PlateMate! 🍽️</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          Thanks for signing up! Please verify your email address to get started.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}"
             style="background-color: #e94560; color: white; padding: 14px 32px;
                    text-decoration: none; border-radius: 8px; font-size: 16px;
                    font-weight: 600; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #888; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #e94560; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="color: #888; font-size: 14px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} PlateMate. All rights reserved.
        </p>
      </div>
    `,
  })
}

/**
 * Send password reset link
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @param {string} token - Raw reset token
 */
export const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`

  await sendEmail({
    to,
    subject: 'Reset your PlateMate password',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">Password Reset 🔐</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="background-color: #e94560; color: white; padding: 14px 32px;
                    text-decoration: none; border-radius: 8px; font-size: 16px;
                    font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #e94560; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #888; font-size: 14px;">
          This link expires in 15 minutes. If you didn't request a password reset, ignore this email — your password won't change.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} PlateMate. All rights reserved.
        </p>
      </div>
    `,
  })
}

/**
 * Send password changed confirmation
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 */
export const sendPasswordChangedEmail = async (to, name) => {
  await sendEmail({
    to,
    subject: 'Your PlateMate password was changed',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">Password Changed ✅</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          Your PlateMate password was successfully changed. All your existing sessions
          have been logged out for security.
        </p>
        <p style="color: #e94560; font-size: 14px; font-weight: 600;">
          If you didn't make this change, please reset your password immediately or contact support.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} PlateMate. All rights reserved.
        </p>
      </div>
    `,
  })
}

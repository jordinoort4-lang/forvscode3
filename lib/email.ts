/**
 * Email Service Library
 * Handles SMTP configuration and sending transactional emails
 */

// SMTP Configuration types
export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Get SMTP configuration from environment variables
 */
export function getSMTPConfig(): SMTPConfig {
  return {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.SMTP_FROM || 'noreply@example.com',
  };
}

/**
 * Check if SMTP is properly configured
 */
export function isSMTPConfigured(): boolean {
  const config = getSMTPConfig();
  return !!(config.host && config.auth.user && config.auth.pass);
}

/**
 * Send an email using the configured SMTP server
 * Falls back to console logging if SMTP is not configured
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // If SMTP is not configured, log to console (for development)
  if (!isSMTPConfigured()) {
    console.log('=== EMAIL (Not configured - Development mode) ===');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text || options.html.substring(0, 200)}...`);
    console.log('=============================================');
    return true;
  }

  // Dynamic import nodemailer only when needed
  try {
    const nodemailer = await import('nodemailer');
    const config = getSMTPConfig();
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    await transporter.sendMail({
      from: config.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Generate HTML email template with consistent styling
 */
export function generateEmailHTML(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
      ${content}
    </div>
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
      <p>If you didn't request this email, please ignore it.</p>
    </div>
  </body>
</html>
  `.trim();
}

// Email Template Generators
export const EmailTemplates = {
  /**
   * Confirm Signup - Email verification
   */
  confirmSignup(name: string, confirmUrl: string): { subject: string; html: string; text: string } {
    const html = generateEmailHTML('Confirm Your Email', `
      <p>Hi ${name || 'there'},</p>
      <p>Thank you for signing up! Please confirm your email address to complete your registration.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${confirmUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm Email</a>
      </p>
      <p>Or copy and paste this link in your browser:<br>${confirmUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `);
    
    return {
      subject: 'Confirm Your Email',
      html,
      text: `Hi ${name || 'there'},\n\nThank you for signing up! Please confirm your email by visiting: ${confirmUrl}\n\nThis link will expire in 24 hours.`,
    };
  },

  /**
   * Invite User - Invite someone to sign up
   */
  inviteUser(inviterName: string, inviteUrl: string): { subject: string; html: string; text: string } {
    const html = generateEmailHTML("You're Invited!", `
      <p>You've been invited to join by ${inviterName || 'someone'}.</p>
      <p>Click the button below to create your account:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a>
      </p>
      <p>Or copy and paste this link in your browser:<br>${inviteUrl}</p>
      <p>This invitation will expire in 7 days.</p>
    `);
    
    return {
      subject: "You're Invited!",
      html,
      text: `You've been invited to join by ${inviterName || 'someone'}.\n\nAccept your invitation here: ${inviteUrl}\n\nThis invitation will expire in 7 days.`,
    };
  },

  /**
   * Magic Link - Passwordless sign in
   */
  magicLink(signInUrl: string): { subject: string; html: string; text: string } {
    const html = generateEmailHTML('Your Magic Sign-In Link', `
      <p>Here's your magic sign-in link. Click the button below to sign in:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${signInUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign In</a>
      </p>
      <p>Or copy and paste this link in your browser:<br>${signInUrl}</p>
      <p><strong>This link will expire in 1 hour</strong> and can only be used once.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `);
    
    return {
      subject: 'Your Magic Sign-In Link',
      html,
      text: `Here's your magic sign-in link: ${signInUrl}\n\nThis link will expire in 1 hour and can only be used once.\n\nIf you didn't request this, you can safely ignore this email.`,
    };
  },

  /**
   * Change Email - Verify new email address
   */
  changeEmail(verifyUrl: string): { subject: string; html: string; text: string } {
    const html = generateEmailHTML('Verify Your New Email', `
      <p>You requested to change your email address. Please verify your new email by clicking the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </p>
      <p>Or copy and paste this link in your browser:<br>${verifyUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please contact support immediately.</p>
    `);
    
    return {
      subject: 'Verify Your New Email',
      html,
      text: `You requested to change your email address.\n\nVerify your new email here: ${verifyUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please contact support immediately.`,
    };
  },

  /**
   * Reset Password
   */
  resetPassword(resetUrl: string): { subject: string; html: string; text: string } {
    const html = generateEmailHTML('Reset Your Password', `
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </p>
      <p>Or copy and paste this link in your browser:<br>${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
    `);
    
    return {
      subject: 'Reset Your Password',
      html,
      text: `You requested to reset your password.\n\nReset your password here: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, your password will remain unchanged.`,
    };
  },

  /**
   * Reauthentication - Confirm identity for sensitive actions
   */
  reauthenticate(verifyUrl: string): { subject: string; html: string; text: string } {
    const html = generateEmailHTML('Verify Your Identity', `
      <p>You requested to perform a sensitive action. Please verify your identity by clicking the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Identity</a>
      </p>
      <p>Or copy and paste this link in your browser:<br>${verifyUrl}</p>
      <p><strong>This link will expire in 10 minutes.</strong></p>
      <p>If you didn't request this, please secure your account immediately.</p>
    `);
    
    return {
      subject: 'Verify Your Identity',
      html,
      text: `Please verify your identity here: ${verifyUrl}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this, please secure your account immediately.`,
    };
  },
};

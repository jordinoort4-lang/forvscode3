/**
 * Email configuration and type definitions
 */

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  from?: string;
  tls?: {
    rejectUnauthorized: boolean;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

export type EmailTemplateType = 
  | 'confirm_signup'
  | 'invite_user'
  | 'magic_link'
  | 'change_email'
  | 'reset_password'
  | 'reauthentication';

export interface EmailTemplate {
  type: EmailTemplateType;
  subject: string;
  html: string;
  text: string;
}

export interface EmailSettings {
  smtpConfigured: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpFrom?: string;
  defaultFromEmail?: string;
  appName?: string;
}

export interface AuthEmailData {
  // Common fields
  appName?: string;
  year?: number;
  
  // Confirm signup
  confirmationUrl?: string;
  expiryHours?: number;
  
  // Invite user
  inviterName?: string;
  inviteUrl?: string;
  expiryDays?: number;
  
  // Magic link
  magicLink?: string;
  expiryMinutes?: number;
  
  // Change email
  newEmail?: string;
  
  // Reset password
  resetUrl?: string;
  
  // Reauthentication
  otpCode?: string;
}
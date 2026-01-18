/**
 * Email Provider Interface
 * Supports multiple email backends with fallback to console logging
 */

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailPayload {
  to: EmailAddress | EmailAddress[];
  from: EmailAddress;
  subject: string;
  html: string;
  text?: string;
  replyTo?: EmailAddress;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<EmailResponse>;
}

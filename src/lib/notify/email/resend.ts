/**
 * Resend Email Provider
 * Primary email backend when RESEND_API_KEY is configured
 */

import type { EmailProvider, EmailPayload, EmailResponse } from './provider';

export class ResendProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(payload: EmailPayload): Promise<EmailResponse> {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(this.apiKey);

      const response = await resend.emails.send({
        from: `${payload.from.name || 'Christina\'s Home Salon'} <${payload.from.email}>`,
        to: Array.isArray(payload.to) 
          ? payload.to.map(t => t.email) 
          : payload.to.email,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo?.email,
      });

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        };
      }

      return {
        success: true,
        messageId: response.data?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Console Email Provider
 * Fallback provider that logs email payloads to console (server-side only)
 */

import type { EmailProvider, EmailPayload, EmailResponse } from './provider';

export class ConsoleProvider implements EmailProvider {
  async send(payload: EmailPayload): Promise<EmailResponse> {
    console.log('📧 EMAIL (Console Provider - Dev Mode)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('From:', payload.from);
    console.log('To:', payload.to);
    console.log('Subject:', payload.subject);
    if (payload.replyTo) {
      console.log('Reply-To:', payload.replyTo);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HTML Body:');
    console.log(payload.html);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (payload.text) {
      console.log('Text Body:');
      console.log(payload.text);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }
}

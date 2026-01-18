/**
 * Email Service
 * Factory for creating email providers with automatic fallback
 */

import { ResendProvider } from './resend';
import { ConsoleProvider } from './console';
import type { EmailProvider } from './provider';

let cachedProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    console.log('✅ Using Resend email provider');
    cachedProvider = new ResendProvider(resendApiKey);
  } else {
    console.log('⚠️  Using Console email provider (dev mode - set RESEND_API_KEY for production)');
    cachedProvider = new ConsoleProvider();
  }

  return cachedProvider;
}

export * from './provider';
export { ResendProvider } from './resend';
export { ConsoleProvider } from './console';

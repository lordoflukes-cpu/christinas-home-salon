import type { Metadata } from 'next';
import { ContactContent } from '@/components/contact/contact-content';
import { BUSINESS_INFO } from '@/content/business';

export const metadata: Metadata = {
  title: `Contact | ${BUSINESS_INFO.name}`,
  description: `Get in touch with ${BUSINESS_INFO.name}. Call, email, or send a message. Serving ${BUSINESS_INFO.serviceArea.region}.`,
  keywords: [
    'contact mobile hairdresser',
    'Southampton hairdresser contact',
    'mobile salon enquiry',
    'Hampshire mobile services contact',
  ],
  openGraph: {
    title: `Contact | ${BUSINESS_INFO.name}`,
    description: `Get in touch with ${BUSINESS_INFO.name}. Call, email, or send a message.`,
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-cream/30">
      <ContactContent />
    </main>
  );
}

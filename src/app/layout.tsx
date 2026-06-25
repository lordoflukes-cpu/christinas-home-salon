import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { BUSINESS_INFO } from '@/content/business';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS_INFO.url),
  title: {
    default: `${BUSINESS_INFO.name} | ${BUSINESS_INFO.tagline}`,
    template: `%s | ${BUSINESS_INFO.name}`,
  },
  description: `${BUSINESS_INFO.name} offers women-only mobile hairdressing, companionship visits, and errand services in ${BUSINESS_INFO.baseTown} and surrounding areas. DBS checked, fully insured, and caring.`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fefdfb' },
    { media: '(prefers-color-scheme: dark)', color: '#fefdfb' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

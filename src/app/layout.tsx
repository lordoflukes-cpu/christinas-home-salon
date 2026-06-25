import type { Metadata, Viewport } from 'next';
import {
  Inter,
  Playfair_Display,
  Cormorant_Garamond,
  Caveat,
} from 'next/font/google';
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

// Etched editorial serif for the Leo keepsake aesthetic.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

// Handwritten accent for letters / captions.
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-caveat',
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
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

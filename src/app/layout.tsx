import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Playfair_Display } from 'next/font/google';
import { Header, Footer, StickyMobileWhatsAppCTA } from '@/components/layout';
import { Toaster } from '@/components/ui/toaster';
import { BUSINESS_INFO } from '@/content/business';
import { generateLocalBusinessSchema, generateWebsiteSchema } from '@/lib/seo';
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
  keywords: [
    'mobile hairdressing',
    'hairdresser at home',
    'companion services',
    'companionship visits',
    'errand services',
    'women only',
    'female hairdresser',
    BUSINESS_INFO.baseTown,
    BUSINESS_INFO.county,
    'elderly care',
    'home visits',
  ],
  authors: [{ name: BUSINESS_INFO.owner }],
  creator: BUSINESS_INFO.name,
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: BUSINESS_INFO.url,
    siteName: BUSINESS_INFO.name,
    title: `${BUSINESS_INFO.name} | ${BUSINESS_INFO.tagline}`,
    description: `Women-only mobile hairdressing, companionship, and errand services in ${BUSINESS_INFO.baseTown}. Book your home visit today.`,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: BUSINESS_INFO.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS_INFO.name} | ${BUSINESS_INFO.tagline}`,
    description: `Women-only mobile hairdressing, companionship, and errand services in ${BUSINESS_INFO.baseTown}.`,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // TODO: Add verification codes when available
    // google: 'verification_code',
  },
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
  const localBusinessSchema = generateLocalBusinessSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 pt-16 md:pt-20">{children}</main>
          <Footer />
        </div>
        <StickyMobileWhatsAppCTA />
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import Script from 'next/script';
import { Header, Footer, StickyMobileWhatsAppCTA } from '@/components/layout';
import { BUSINESS_INFO } from '@/content/business';
import { generateLocalBusinessSchema, generateWebsiteSchema } from '@/lib/seo';

export const metadata: Metadata = {
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
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessSchema = generateLocalBusinessSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-16 md:pt-20">{children}</main>
        <Footer />
      </div>
      <StickyMobileWhatsAppCTA />
    </>
  );
}

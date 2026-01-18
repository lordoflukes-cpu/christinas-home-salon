import type { Metadata } from 'next';
import { BUSINESS_INFO } from '@/content/business';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christinas-hair-and-care.co.uk';

/**
 * Default site metadata
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BUSINESS_INFO.name} | Mobile Hairdressing & Companionship`,
    template: `%s | ${BUSINESS_INFO.name}`,
  },
  description: BUSINESS_INFO.tagline,
  keywords: [
    'mobile hairdresser',
    'mobile hair salon',
    'home hairdresser',
    'Southampton hairdresser',
    'Hampshire mobile salon',
    'women only hairdresser',
    'companionship services',
    'elderly companionship',
    'errands service',
    'mobile beauty',
  ],
  authors: [{ name: 'Christina' }],
  creator: BUSINESS_INFO.name,
  publisher: BUSINESS_INFO.name,
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteUrl,
    siteName: BUSINESS_INFO.name,
    title: BUSINESS_INFO.name,
    description: BUSINESS_INFO.tagline,
    images: [
      {
        url: `${siteUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_INFO.name} - Mobile Hairdressing & Companionship`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: BUSINESS_INFO.name,
    description: BUSINESS_INFO.tagline,
    images: [`${siteUrl}/images/og-image.jpg`],
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'business',
};

/**
 * Generate page-specific metadata
 */
export function generatePageMetadata(options: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const { title, description, path = '', image, noIndex = false } = options;
  const url = `${siteUrl}${path}`;
  const imageUrl = image || `${siteUrl}/images/og-image.jpg`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${BUSINESS_INFO.name}`,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title: `${title} | ${BUSINESS_INFO.name}`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

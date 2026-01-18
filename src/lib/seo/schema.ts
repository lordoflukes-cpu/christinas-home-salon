import { BUSINESS_INFO } from '@/content/business';
import { getAverageRating, getReviewCount, REVIEWS } from '@/content/reviews';

/**
 * Generate JSON-LD structured data for Local Business
 * Helps with SEO and Google Business Profile integration
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://christinas-hair-and-care.co.uk'}#business`,
    name: BUSINESS_INFO.name,
    description: BUSINESS_INFO.tagline,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://christinas-hair-and-care.co.uk',
    telephone: BUSINESS_INFO.contact.phone,
    email: BUSINESS_INFO.contact.email,
    priceRange: '££',
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Southampton',
      addressRegion: 'Hampshire',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.9097, // Southampton approximate
      longitude: -1.4044,
    },
    areaServed: BUSINESS_INFO.serviceArea.areas.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: BUSINESS_INFO.hours.weekdays.open,
        closes: BUSINESS_INFO.hours.weekdays.close,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: BUSINESS_INFO.hours.saturday.open,
        closes: BUSINESS_INFO.hours.saturday.close,
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: getAverageRating(),
      reviewCount: getReviewCount(),
      bestRating: 5,
      worstRating: 1,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mobile Hairdressing',
            description: 'Professional hairdressing services in your home',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Companionship Visits',
            description: 'Friendly companionship and social visits',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Errands & Shopping',
            description: 'Help with shopping and everyday errands',
          },
        },
      ],
    },
  };
}

/**
 * Generate JSON-LD for a single service
 */
export function generateServiceSchema(service: {
  name: string;
  description: string;
  price: number;
  duration?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_INFO.name,
    },
    areaServed: {
      '@type': 'State',
      name: 'Hampshire',
    },
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'GBP',
    },
    ...(service.duration && {
      duration: `PT${service.duration}M`,
    }),
  };
}

/**
 * Generate JSON-LD for reviews
 */
export function generateReviewSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_INFO.name,
    review: REVIEWS.slice(0, 10).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.text,
      datePublished: review.date,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: getAverageRating(),
      reviewCount: getReviewCount(),
    },
  };
}

/**
 * Generate JSON-LD for FAQ page
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD breadcrumb
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD for the website
 */
export function generateWebsiteSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christinas-hair-and-care.co.uk';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_INFO.name,
    url: siteUrl,
    description: BUSINESS_INFO.tagline,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

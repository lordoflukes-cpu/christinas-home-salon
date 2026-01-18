import type { Metadata } from 'next';
import { ReviewsContent } from '@/components/reviews/reviews-content';
import { BUSINESS_INFO } from '@/content/business';
import { REVIEWS, getAverageRating, getReviewCount } from '@/content/reviews';

export const metadata: Metadata = {
  title: `Reviews & Testimonials | ${BUSINESS_INFO.name}`,
  description: `Read what clients say about ${BUSINESS_INFO.name}. ${getReviewCount()} reviews with an average ${getAverageRating()}-star rating.`,
  keywords: [
    'mobile hairdresser reviews',
    'Southampton hairdresser testimonials',
    'Christina hairdresser reviews',
    'mobile salon reviews Hampshire',
    'customer feedback',
  ],
  openGraph: {
    title: `Reviews & Testimonials | ${BUSINESS_INFO.name}`,
    description: `Read what clients say about ${BUSINESS_INFO.name}. Real reviews from real customers.`,
    type: 'website',
  },
};

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-cream/30">
      <ReviewsContent />
    </main>
  );
}

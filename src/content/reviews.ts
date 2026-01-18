export interface Review {
  id: string;
  name: string;
  location: string;
  service: 'hairdressing' | 'companion' | 'errands' | 'package';
  rating: number; // 1-5
  text: string;
  date: string; // ISO date string
  highlight?: string; // Pull quote
  verified?: boolean;
}

// Mock reviews - replace with real reviews when available
export const REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Margaret T.',
    location: 'Chelmsford',
    service: 'companion',
    rating: 5,
    text: 'Christina has been visiting me every week for the past six months and I genuinely look forward to her visits. She\'s warm, kind, and we always have lovely conversations. It\'s made such a difference to my week.',
    date: '2025-12-15',
    highlight: 'I genuinely look forward to her visits',
    verified: true,
  },
  {
    id: '2',
    name: 'Susan K.',
    location: 'Braintree',
    service: 'hairdressing',
    rating: 5,
    text: 'After my hip operation, I couldn\'t get to the salon. Christina came to my home and did a beautiful job on my hair. She was patient, professional, and made me feel so much better about myself. Highly recommend!',
    date: '2025-11-28',
    highlight: 'Patient, professional, and made me feel so much better',
    verified: true,
  },
  {
    id: '3',
    name: 'Dorothy M.',
    location: 'Witham',
    service: 'package',
    rating: 5,
    text: 'I have the monthly package and it\'s wonderful value. Christina does my hair beautifully and the companion visits in between mean I always have something to look forward to. My daughter is so relieved to know someone trustworthy is checking in on me.',
    date: '2025-12-02',
    highlight: 'Always have something to look forward to',
    verified: true,
  },
  {
    id: '4',
    name: 'Patricia H.',
    location: 'Colchester',
    service: 'errands',
    rating: 5,
    text: 'Christina does my weekly shopping for me now and it\'s taken such a weight off. She always remembers what I like and even checks for offers. The companionship while she drops it off is a lovely bonus!',
    date: '2025-10-18',
    highlight: 'Taken such a weight off',
    verified: true,
  },
  {
    id: '5',
    name: 'Jean W.',
    location: 'Maldon',
    service: 'hairdressing',
    rating: 5,
    text: 'I\'ve been having my hair done at home for years but Christina is by far the best. She listens to what I want, gives honest advice, and the results are always lovely. Plus she\'s great company!',
    date: '2025-11-05',
    highlight: 'By far the best mobile hairdresser',
    verified: true,
  },
  {
    id: '6',
    name: 'Barbara L.',
    location: 'Chelmsford',
    service: 'companion',
    rating: 5,
    text: 'Since losing my husband, I\'d become quite isolated. Christina\'s visits have given me something to look forward to each week. We play cards, chat about everything, and she genuinely cares. A godsend.',
    date: '2025-09-22',
    highlight: 'A godsend',
    verified: true,
  },
  {
    id: '7',
    name: 'Eileen R.',
    location: 'Billericay',
    service: 'errands',
    rating: 5,
    text: 'Christina accompanied me to a hospital appointment when my daughter couldn\'t make it. She was calm, supportive, and helped me remember everything the doctor said. I felt so much less anxious having her there.',
    date: '2025-11-12',
    highlight: 'I felt so much less anxious',
    verified: true,
  },
  {
    id: '8',
    name: 'Maureen C.',
    location: 'Brentwood',
    service: 'package',
    rating: 5,
    text: 'The Complete Care Package is perfect for my mum. She gets her hair done, has company, and Christina helps with errands. It gives me peace of mind knowing mum has regular support from someone so lovely.',
    date: '2025-12-08',
    highlight: 'Gives me peace of mind',
    verified: true,
  },
];

// Get reviews by service type
export function getReviewsByService(service: Review['service']): Review[] {
  return REVIEWS.filter((review) => review.service === service);
}

// Get featured reviews (for homepage)
export function getFeaturedReviews(count: number = 3): Review[] {
  return REVIEWS.filter((review) => review.highlight)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

// Calculate average rating
export function getAverageRating(): number {
  const total = REVIEWS.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / REVIEWS.length) * 10) / 10;
}

// Get total review count
export function getReviewCount(): number {
  return REVIEWS.length;
}

// Format date for display
export function formatReviewDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

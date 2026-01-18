'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  REVIEWS,
  getAverageRating,
  getReviewCount,
  getReviewsByService,
  type Review,
} from '@/content/reviews';

const serviceFilters: { id: 'all' | Review['service']; label: string }[] = [
  { id: 'all', label: 'All Reviews' },
  { id: 'hairdressing', label: 'Hairdressing' },
  { id: 'companion', label: 'Companionship' },
  { id: 'errands', label: 'Errands' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <StarRating rating={review.rating} />
              <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
            </div>
            {review.verified && (
              <Badge variant="success" className="text-xs">
                ✓ Verified
              </Badge>
            )}
          </div>

          <blockquote className="mt-4 text-foreground/90">"{review.text}"</blockquote>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{review.name}</p>
              <p className="text-sm text-muted-foreground">{review.location}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {review.service}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ReviewsContent() {
  const [activeFilter, setActiveFilter] = useState<'all' | Review['service']>('all');
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredReviews =
    activeFilter === 'all' ? REVIEWS : getReviewsByService(activeFilter);

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  const averageRating = getAverageRating();
  const totalReviews = getReviewCount();

  // Count reviews by rating
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: REVIEWS.filter((r) => r.rating === rating).length,
    percentage: (REVIEWS.filter((r) => r.rating === rating).length / REVIEWS.length) * 100,
  }));

  return (
    <>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-rose-50 to-sage-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-playfair text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
              Client Reviews
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Real feedback from real clients
            </p>
          </div>
        </div>
      </section>

      {/* Summary stats */}
      <section className="border-b border-sage-100 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Overall rating */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center gap-4 md:justify-start">
                  <span className="font-playfair text-6xl font-bold text-primary">
                    {averageRating}
                  </span>
                  <div>
                    <StarRating rating={Math.round(averageRating)} />
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on {totalReviews} reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating breakdown */}
              <div className="space-y-2">
                {ratingCounts.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="w-4 text-sm text-muted-foreground">{rating}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: (5 - rating) * 0.1 }}
                        className="h-full rounded-full bg-amber-400"
                      />
                    </div>
                    <span className="w-8 text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-sage-100 bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap justify-center gap-2">
              {serviceFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveFilter(filter.id);
                    setVisibleCount(6);
                  }}
                >
                  {filter.label}
                  {filter.id !== 'all' && (
                    <span className="ml-1 text-xs opacity-70">
                      ({getReviewsByService(filter.id as Review['service']).length})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            {filteredReviews.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No reviews found for this category.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {visibleReviews.map((review, index) => (
                    <ReviewCard key={review.id} review={review} index={index} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                    >
                      Load More Reviews
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-gradient-to-r from-primary to-rose-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-playfair text-2xl font-bold md:text-3xl">
              Ready to Join These Happy Clients?
            </h2>
            <p className="mt-3 text-rose-100">
              Book your appointment today and experience the difference
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-6 bg-white text-primary hover:bg-rose-50"
            >
              <a href="/booking">Book Now</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

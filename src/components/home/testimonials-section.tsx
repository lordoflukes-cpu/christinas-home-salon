'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFeaturedReviews, formatReviewDate, getAverageRating, getReviewCount } from '@/content/reviews';

export function TestimonialsSection() {
  const reviews = getFeaturedReviews(3);
  const rating = getAverageRating();
  const count = getReviewCount();

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="heading-2"
          >
            What Clients Say
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-lg font-medium text-foreground">
              {rating} average
            </span>
            <span className="text-muted-foreground">from {count} reviews</span>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20" />

                  {/* Highlight quote */}
                  {review.highlight && (
                    <p className="mt-4 text-xl font-medium text-foreground italic">
                      &ldquo;{review.highlight}&rdquo;
                    </p>
                  )}

                  {/* Full review text */}
                  <p className="mt-4 text-muted-foreground">{review.text}</p>

                  {/* Rating */}
                  <div className="mt-4 flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="mt-4 border-t pt-4">
                    <p className="font-medium text-foreground">{review.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {review.location} • {formatReviewDate(review.date)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/reviews">
              Read All Reviews
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

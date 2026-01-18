'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WOMEN_ONLY_STATEMENT } from '@/content/boundaries';
import { getAverageRating, getReviewCount } from '@/content/reviews';

export function HeroSection() {
  const rating = getAverageRating();
  const reviewCount = getReviewCount();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream-50 to-background pb-16 pt-8 md:pb-24 md:pt-12">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-rose-200/20 blur-3xl" />
      </div>

      <div className="container-custom">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-wrap items-center justify-center gap-3"
          >
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-green-600" />
              DBS Checked
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              Fully Insured
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Women Only
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="heading-1 text-balance"
          >
            Professional Care & Beauty
            <span className="block text-primary">Brought to Your Home</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="body-large mx-auto mt-6 max-w-2xl text-balance"
          >
            {WOMEN_ONLY_STATEMENT.medium} Mobile hairdressing, friendly companionship,
            and helpful errands – all delivered with genuine care.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/booking">
                Book Your Visit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
              <Link href="/services">View Services</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8"
          >
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                {rating} rating
              </span>
              <span className="text-sm text-muted-foreground">
                ({reviewCount} reviews)
              </span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <p className="text-sm text-muted-foreground">
              Serving Chelmsford & surrounding areas
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

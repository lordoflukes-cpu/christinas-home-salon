'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/content/business';

export function CTASection() {
  return (
    <section className="section-padding bg-primary">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Book Your First Visit?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Experience the comfort and convenience of professional hair care and
            companionship in your own home. Book online in less than 30 seconds.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="xl"
              variant="secondary"
              className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
            >
              <Link href="/booking">
                Book Your Visit Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
            >
              <a href={`tel:${BUSINESS_INFO.contact.phone.replace(/\s/g, '')}`}>
                <Phone className="mr-2 h-5 w-5" />
                Call {BUSINESS_INFO.contact.phone}
              </a>
            </Button>
          </div>

          <p className="mt-6 text-sm text-primary-foreground/60">
            Questions? Call or message me – I&apos;m always happy to chat.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

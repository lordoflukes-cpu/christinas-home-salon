'use client';

import { motion } from 'framer-motion';
import { Shield, Award, Clock, Heart, MapPin, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/content/business';

const trustItems = [
  {
    icon: Shield,
    title: 'DBS Checked',
    description: 'Enhanced criminal records check for your complete peace of mind.',
  },
  {
    icon: Award,
    title: 'Fully Insured',
    description: 'Public liability insurance covering all services in your home.',
  },
  {
    icon: Clock,
    title: 'NVQ Qualified',
    description: 'Professional NVQ Level 2 qualified hairdressing expertise.',
  },
  {
    icon: Heart,
    title: 'Women Only',
    description: 'A safe, comfortable service by a woman, for women only.',
  },
  {
    icon: MapPin,
    title: 'Local Service',
    description: `Based in ${BUSINESS_INFO.baseTown}, serving a 15-mile radius.`,
  },
  {
    icon: Phone,
    title: 'Always Available',
    description: 'Book online 24/7 or call during business hours.',
  },
];

export function TrustSection() {
  return (
    <section className="section-padding bg-sage-50/50">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="heading-2"
          >
            Your Safety & Trust Matter
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            When you invite someone into your home, you need to know you can trust
            them completely. Here&apos;s why you can trust Christina.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex gap-4 rounded-xl bg-background p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

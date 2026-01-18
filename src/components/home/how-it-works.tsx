'use client';

import { motion } from 'framer-motion';
import { Calendar, Home, Smile } from 'lucide-react';

const steps = [
  {
    icon: Calendar,
    title: '1. Book Online',
    description:
      'Choose your service, pick a time that suits you, and book in less than 30 seconds.',
  },
  {
    icon: Home,
    title: '2. I Come to You',
    description:
      'Relax at home while I bring everything needed for your appointment.',
  },
  {
    icon: Smile,
    title: '3. Enjoy & Feel Great',
    description:
      'Experience professional, caring service in the comfort of your own home.',
  },
];

export function HowItWorks() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="heading-2"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Getting started is simple. Book your visit and I&apos;ll take care of
            everything else.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-10 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-primary/20 md:block" />
              )}

              <div className="relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-10 w-10" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

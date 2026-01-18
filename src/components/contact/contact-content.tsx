'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { contactFormSchema, type ContactForm } from '@/lib/schema/booking-schema';
import { BUSINESS_INFO } from '@/content/business';
import { WOMEN_ONLY_STATEMENT } from '@/content/boundaries';
import { EnquiryForm } from './enquiry-form';

const contactMethods = [
  {
    icon: '📞',
    title: 'Phone',
    value: BUSINESS_INFO.contact.phone,
    href: `tel:${BUSINESS_INFO.contact.phone}`,
    description: 'Best for urgent enquiries',
  },
  {
    icon: '✉️',
    title: 'Email',
    value: BUSINESS_INFO.contact.email,
    href: `mailto:${BUSINESS_INFO.contact.email}`,
    description: 'I reply within 24 hours',
  },
  {
    icon: '💬',
    title: 'WhatsApp',
    value: 'Send a message',
    href: `https://wa.me/${BUSINESS_INFO.contact.phone.replace(/\s/g, '')}`,
    description: 'Quick and convenient',
  },
];

const enquiryTypes = [
  'General Enquiry',
  'Booking Question',
  'Service Information',
  'Pricing Query',
  'Feedback',
  'Other',
];

export function ContactContent() {
  const searchParams = useSearchParams();
  const isEnquiryForm = searchParams.get('type') === 'enquiry';

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      acceptedPolicy: false,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const acceptedPolicy = watch('acceptedPolicy');

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    // TODO: Integrate with form submission service (Formspree, Netlify Forms, etc.)
    console.log('Contact form submitted:', data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  // Show enquiry form if type=enquiry in query params
  if (isEnquiryForm) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <EnquiryForm />
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-rose-50 to-sage-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-playfair text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Questions? Enquiries? I'd love to hear from you
            </p>
          </div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="border-b border-sage-100 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={method.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <span className="text-3xl">{method.icon}</span>
                    <h3 className="mt-3 font-semibold text-foreground">{method.title}</h3>
                    <p className="mt-1 font-medium text-primary group-hover:underline">
                      {method.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form and info */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
            {/* Contact form */}
            <div>
              <h2 className="font-playfair text-2xl font-bold text-primary">
                Send a Message
              </h2>
              <p className="mt-2 text-muted-foreground">
                Fill out the form below and I'll get back to you as soon as possible
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8"
                >
                  <Card className="border-sage-200 bg-sage-50">
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
                        <span className="text-3xl">✓</span>
                      </div>
                      <h3 className="font-playfair text-xl font-bold text-primary">
                        Message Sent!
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        Thank you for getting in touch. I'll reply within 24 hours.
                      </p>
                      <Button
                        className="mt-6"
                        variant="outline"
                        onClick={() => {
                          setIsSubmitted(false);
                          form.reset();
                        }}
                      >
                        Send Another Message
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Jane Smith"
                        className="mt-1"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="jane@example.com"
                        className="mt-1"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        placeholder="07700 900000"
                        className="mt-1"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <select
                        id="subject"
                        {...register('subject')}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Select a topic...</option>
                        {enquiryTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder="How can I help you?"
                      rows={5}
                      className="mt-1"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acceptedPolicy"
                      checked={acceptedPolicy}
                      onCheckedChange={(checked) =>
                        setValue('acceptedPolicy', checked === true)
                      }
                    />
                    <Label
                      htmlFor="acceptedPolicy"
                      className="text-sm font-normal leading-relaxed text-muted-foreground"
                    >
                      I agree to the{' '}
                      <a href="/privacy" className="text-primary underline">
                        privacy policy
                      </a>{' '}
                      and consent to being contacted about my enquiry *
                    </Label>
                  </div>
                  {errors.acceptedPolicy && (
                    <p className="text-sm text-red-500">{errors.acceptedPolicy.message}</p>
                  )}

                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>

            {/* Info sidebar */}
            <div className="space-y-6">
              {/* Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>🕐</span> Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">
                      {BUSINESS_INFO.hours.weekdays.open} - {BUSINESS_INFO.hours.weekdays.close}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">
                      {BUSINESS_INFO.hours.saturday.open} - {BUSINESS_INFO.hours.saturday.close}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">{BUSINESS_INFO.hours.sunday.status}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Service area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>📍</span> Service Area
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Serving {BUSINESS_INFO.serviceArea.region}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {BUSINESS_INFO.serviceArea.areas.slice(0, 6).map((area, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-sage-50 px-3 py-1 text-xs text-sage-700"
                      >
                        {area}
                      </span>
                    ))}
                    {BUSINESS_INFO.serviceArea.areas.length > 6 && (
                      <span className="rounded-full bg-sage-50 px-3 py-1 text-xs text-sage-700">
                        +{BUSINESS_INFO.serviceArea.areas.length - 6} more
                      </span>
                    )}
                  </div>
                  <a
                    href="/booking"
                    className="mt-4 inline-block text-sm text-primary hover:underline"
                  >
                    Check your postcode →
                  </a>
                </CardContent>
              </Card>

              {/* Women only notice */}
              <Card className="border-rose-200 bg-rose-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💜</span>
                    <div>
                      <h3 className="font-semibold text-primary">
                        {WOMEN_ONLY_STATEMENT.short}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {WOMEN_ONLY_STATEMENT.medium}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick booking */}
              <Card className="bg-gradient-to-br from-primary to-rose-600 text-white">
                <CardContent className="p-6 text-center">
                  <h3 className="font-playfair text-xl font-bold">Ready to Book?</h3>
                  <p className="mt-2 text-rose-100">
                    Book your appointment in under 30 seconds
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    className="mt-4 bg-white text-primary hover:bg-rose-50"
                  >
                    <a href="/booking">Book Now</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="border-t border-sage-100 bg-sage-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-playfair text-2xl font-bold text-primary">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find quick answers to common questions
            </p>
            <Button asChild variant="outline" className="mt-6">
              <a href="/#faqs">View FAQs</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

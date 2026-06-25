import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BUSINESS_INFO } from '@/content/business';
import { WOMEN_ONLY_STATEMENT, SERVICE_BOUNDARIES } from '@/content/boundaries';

export const metadata: Metadata = {
  title: `About Christina | ${BUSINESS_INFO.name}`,
  description: `Meet Christina - your friendly mobile hairdresser and companion in ${BUSINESS_INFO.serviceArea.region}. Professional, caring service exclusively for women.`,
  keywords: [
    'about mobile hairdresser',
    'Christina hairdresser',
    'Southampton mobile salon',
    'Hampshire mobile hairdresser story',
    'women mobile hair services',
  ],
  openGraph: {
    title: `About Christina | ${BUSINESS_INFO.name}`,
    description: `Meet Christina - your friendly mobile hairdresser and companion in ${BUSINESS_INFO.serviceArea.region}.`,
    type: 'profile',
  },
};

const qualifications = [
  'NVQ Level 2 & 3 in Hairdressing',
  'DBS Enhanced Check (Updated Service)',
  'Fully Insured',
  'First Aid Certified',
  '15+ Years Experience',
];

const values = [
  {
    title: 'Comfort First',
    description:
      'Your home is your sanctuary. I bring the salon to you, creating a relaxed atmosphere where you can truly enjoy being pampered.',
    icon: '🏠',
  },
  {
    title: 'Genuine Connection',
    description:
      'Every appointment includes time for a cuppa and a chat. Because looking after your wellbeing is just as important as looking after your hair.',
    icon: '💬',
  },
  {
    title: 'Professional Standards',
    description:
      'Quality products, proper technique, and attention to detail. Your hair deserves the best, whether it\'s a simple trim or a full colour service.',
    icon: '✨',
  },
  {
    title: 'Safe Space',
    description:
      'As a women-only service, I provide a comfortable environment where you can relax completely without any concerns.',
    icon: '💜',
  },
];

const story = [
  "Hello, I'm Christina. I've been a hairdresser for over 20 years, and for much of that time I've worked right here in and around Sutton, helping women feel confident, comfortable, and looked after.",
  "After years in a salon, I realised that for many women, getting to an appointment isn't always simple. Busy schedules, health challenges, caring responsibilities, or just the effort of travelling can make a salon visit stressful — or sometimes impossible. That's why I created Christina's Home Salon: a professional, salon-quality service brought to you, in your own space, at a time that works for you.",
  "Over time, something else became clear. Many clients valued the visit for more than the hair — they valued the conversation, the reassurance, and having someone friendly and trustworthy around. With my own experience in companionship work for over 2 years, including working with a care company, I understand how much difference a calm, supportive presence can make.",
  "That's why I also offer women-only companionship and errand support alongside hairdressing. Whether it's a friendly visit, a bit of company while you're getting ready, or help with simple errands, my aim is to make life feel that little bit easier — and a lot less rushed.",
  "Every visit is professional, respectful, and unhurried. My goal is simple: help women feel well-groomed, cared for, and supported — without the pressure of a salon environment.",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-cream to-sage-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">
                {WOMEN_ONLY_STATEMENT.short}
              </Badge>
              <h1 className="font-playfair text-4xl font-bold text-primary md:text-5xl lg:text-6xl">
                Hello, I'm Christina
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Your friendly neighbourhood mobile hairdresser & companion
              </p>
              <p className="mt-6 text-lg text-foreground/80">
                Bringing professional hair care and genuine companionship to your
                doorstep across {BUSINESS_INFO.serviceArea.region}.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/booking">Book an Appointment</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/services">View Services</Link>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-md">
              {/* Christina's photo */}
              <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/christina-photo.jpg"
                  alt="Christina - Mobile Hairdresser"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-rose-200/50" />
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-sage-200/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Story section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-playfair text-3xl font-bold text-primary md:text-4xl">
              My Story
            </h2>
            <div className="mt-8 space-y-6">
              {story.map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed text-foreground/80">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications section */}
      <section className="bg-cream/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-playfair text-3xl font-bold text-primary md:text-4xl">
              Qualifications & Trust
            </h2>
            <p className="mt-4 text-center text-muted-foreground">
              Your safety and satisfaction are my top priorities
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {qualifications.map((qual, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"
                >
                  <span className="text-sage-600">✓</span>
                  <span className="font-medium text-foreground">{qual}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {BUSINESS_INFO.trust.slice(0, 4).map((trust, index) => (
                <Card key={index} className="border-sage-200">
                  <CardContent className="flex items-start gap-4 p-6">
                    <span className="text-2xl">{trust.icon}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{trust.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {trust.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-playfair text-3xl font-bold text-primary md:text-4xl">
              What I Believe In
            </h2>
            <p className="mt-4 text-center text-muted-foreground">
              The values that guide every appointment
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {values.map((value, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-sage-100 text-2xl">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-1 text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service boundaries */}
      <section className="bg-sage-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-playfair text-3xl font-bold text-primary md:text-4xl">
              Clear About What I Do
            </h2>
            <p className="mt-4 text-muted-foreground">
              To ensure I can provide the best possible service, here's what's
              included – and what isn't
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="border-sage-200 bg-white">
                <CardContent className="p-6">
                  <h3 className="mb-4 flex items-center justify-center gap-2 font-semibold text-sage-700">
                    <span className="text-green-500">✓</span> What I Offer
                  </h3>
                  <ul className="space-y-2 text-left">
                    {SERVICE_BOUNDARIES.included.companionship.items.slice(0, 6).map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 text-green-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-rose-200 bg-white">
                <CardContent className="p-6">
                  <h3 className="mb-4 flex items-center justify-center gap-2 font-semibold text-rose-700">
                    <span className="text-rose-500">✕</span> What I Don't Do
                  </h3>
                  <ul className="space-y-2 text-left">
                    {SERVICE_BOUNDARIES.excluded.slice(0, 6).map((category, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 text-rose-500">•</span>
                        {category.category}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              {SERVICE_BOUNDARIES.emergency.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-gradient-to-r from-primary to-rose-600 py-16 text-white md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-playfair text-3xl font-bold md:text-4xl">
              Let's Get to Know Each Other
            </h2>
            <p className="mt-4 text-rose-100">
              Whether you need a haircut, some company, or both – I'd love to hear
              from you. Book your first appointment and let's have a cuppa.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-rose-50"
              >
                <Link href="/booking">Book Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
